const { Modal } = bootstrap;

var app = new Vue({
    el: '#app',
    data: {
      guessInput: '',
      secretInput: '',
      lastGuess: '',
      modal: null,
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
                  alert('오답 ㅠㅠ');
                }
              } else {
                alert(res.message);
              }
            });
        }

        this.guessInput = '';
        this.$refs.guessInput.focus();
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