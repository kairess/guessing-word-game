const { Modal } = bootstrap;

var app = new Vue({
    el: '#app',
    data: {
      guessInput: '',
      secretInput: '',
      lastGuess: '',
      modal: null,
      history: [],
    },
    methods: {
      input() {
        this.guessInput = this.guessInput.replace(/[a-zA-Z\s]/g, '');
      },
      inputSecret() {
        this.secretInput = this.secretInput.replace(/[a-zA-Z\s]/g, '');
      },
      submit(e) {
        e.preventDefault();

        if (this.guessInput) {
          this.lastGuess = this.guessInput;

          const payload = {
            'guess_word': this.guessInput,
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
                    word: this.guessInput,
                    similarity: (res.data.similarity * 100).toFixed(2),
                    className: className
                  });

                  this.history.sort(function(first, second) {
                    return second.similarity - first.similarity;
                  });
                }
              } else {
                alert(res.message);
              }
            })
            .finally(() => {
              this.guessInput = '';
              this.$refs.guessInput.focus();
            });
        }
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