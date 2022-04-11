const { Modal } = bootstrap;

var app = new Vue({
    el: '#app',
    data: {
      guessInput: '',
      secretInput: '',
      lastGuess: '',
      modal: null,
      history: [],
      message: '',
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
          secret_word: this.secretInput,
        };

        axios
            .post('/set_secret', payload)
            .then((res) => {
              if (res.data.status == 'success') {
                this.message = '새로운 단어를 설정하였습니다. 친구에게 공유해서 단어를 맞추게 해보세요!';
                this.modal.hide();
              } else {
                this.message = res.data.message;
                alert(res.data.message);
              }
            });
      },
      init() {
        this.$refs.guessInput.focus();

        this.modal = new Modal(document.getElementById('secretModal'), {
          keyboard: false,
          backdrop: 'static',
        });
      },
    },
    mounted() {
      this.init();
    }
  });