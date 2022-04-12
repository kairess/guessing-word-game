const { Modal } = bootstrap;

var app = new Vue({
    el: '#app',
    data: {
      guessInput: '',
      secretInput: '',
      secretUser: '',
      lastGuess: '',
      modal: null,
      history: [],
      message: '',
      hof: [],
    },
    methods: {
      input() {
        this.guessInput = this.guessInput.replace(/[^가-힣]/g, '');
      },
      inputSecret() {
        this.secretInput = this.secretInput.replace(/[^가-힣]/g, '');
      },
      submit(e) {
        e.preventDefault();

        if (this.guessInput) {
          this.lastGuess = this.guessInput;

          const payload = {
            guess_word: this.guessInput,
          }

          axios
            .post('/guess', payload)
            .then((res) => {
              if (res.data.status == 'success') {
                if (res.data.result) { // correct
                  this.modal.show();
                  
                  setTimeout(() => {
                    this.$refs.secretInput.focus();
                  }, 500);

                  this.history.push({
                    i: this.history.length + 1,
                    word: this.guessInput,
                    similarity: 100,
                    className: 'bg-primary'
                  });

                  this.history.sort(function(first, second) {
                    return second.similarity - first.similarity;
                  });
                } else { // incorrect
                  let className = 'bg-secondary';

                  if (res.data.similarity > 0.9) {
                    className = 'bg-danger';
                  } else if (res.data.similarity > 0.7) {
                    className = 'bg-warning';
                  } else if (res.data.similarity > 0.5) {
                    className = 'bg-secondary';
                  }

                  this.history.push({
                    i: this.history.length + 1,
                    word: this.guessInput,
                    similarity: (res.data.similarity * 100).toFixed(2),
                    className: className
                  });

                  this.history.sort(function(first, second) {
                    return second.similarity - first.similarity;
                  });
                }
              } else {
                this.message = res.data.message;
              }
            })
            .finally(() => {
              this.guessInput = '';
              this.$refs.guessInput.focus();
            });
        }
      },
      submitSecret() {
        if (!this.secretInput) {
          this.$refs.secretInput.focus();
          return false;
        }

        const payload = {
          secret_user: this.secretUser,
          secret_word: this.secretInput,
          trials: this.history.length,
        };

        document.cookie = `username=${this.secretUser}; expires=Fri, 31 Dec 2032 00:00:00 UTC`;

        axios
            .post('/set_secret', payload)
            .then((res) => {
              if (res.data.status == 'success') {
                this.message = res.data.message;
                this.hof.unshift({
                  id: this.hof[0].id + 1,
                  word: '???',
                  trials: this.history.length,
                  username: this.secretUser,
                  datetime: '방금 전',
                });

                this.modal.hide();
              } else {
                this.message = res.data.message;
              }
            });
      },
      init() {
        this.$refs.guessInput.focus();

        this.modal = new Modal(document.getElementById('secretModal'), {
          keyboard: false,
          backdrop: 'static',
        });

        this.secretUser = this.getCookie('username');
      },
      getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      },
    },
    mounted() {
      this.init();

      axios
          .get('/get_hof')
          .then((res) => {
            this.hof = res.data;
          });
    }
  });