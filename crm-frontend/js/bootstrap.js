document.addEventListener('DOMContentLoaded', function(){
  /* tooltips */
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  /* ----------------------------------------------------------------- */
  
});