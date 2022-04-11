const { Modal } = bootstrap;

var app = new Vue({
    el: '#app',
    data: {
      guessInput: '',
      modal: null,
    },
    methods: {
      input() {
        this.guessInput = this.guessInput.replace(/\s/g, '');
      },
      submit(e) {
        e.preventDefault();

        if (this.guessInput) {
          const payload = {
            'guess_word': this.guessInput,
          }

          axios
            .post('/guess', payload)
            .then((res) => {
              if (res.data.status == 'success') {
                if (res.data.result) { // correct
                  this.modal.show();
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
      moveBySpeed(dir) {
        const payload = {
          dir: dir
        }
  
        axios
          .post('/move_by_speed', payload)
          .then((res) => {
            console.log(res.data);
          })
      },
    },
    mounted() {
      this.init();
    }
  });