export default function (app) {
  console.log(`26 app`, app)
  app.directive('focus3', {
    mounted(el) {
      const input = el.nodeName === 'INPUT' ? el : el.querySelector('input')
      setTimeout(() => {
        input.focus()
      }, 0)
    },
    updated(el) {
      const input = el.nodeName === 'INPUT' ? el : el.querySelector('input')
      setTimeout(() => {
        input.focus()
      }, 0)
    },
  })
}
