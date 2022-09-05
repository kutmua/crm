document.addEventListener('DOMContentLoaded', function(){
  const elements = document.querySelectorAll('.select-custom');
  elements.forEach(elem => {
    const choices = new Choices(elem, {
      searchEnabled: false,
      position: 'bottom',
      placeholder: true,
      itemSelectText: '',
      silent: true,
      shouldSort: false
    });

  })
});