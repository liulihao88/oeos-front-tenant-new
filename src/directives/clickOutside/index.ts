// click-outside.js
export const clickOutside = {
  beforeMount(el, binding) {
    console.log(`19 el`, el)
    // 绑定事件处理函数
    const handler = (event) => {
      // 检查点击事件是否发生在元素外部
      if (!(el === event.target || el.contains(event.target))) {
        // 如果是外部点击，则执行绑定的函数
        binding.value(event)
      }
    }
    // 在全局添加点击事件监听器
    document.addEventListener('click', handler)
    // 保存处理函数，以便在 unmounted 时移除
    el.__clickOutsideHandler = handler
  },
  unmounted(el) {
    // 移除事件监听器
    document.removeEventListener('click', el.__clickOutsideHandler)
  },
}
