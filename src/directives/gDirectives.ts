export default function (app) {
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
