import * as svg from './svg.js';
const CRM_URL = 'http://localhost:3000';

/* getInfoClient() функция получения информации о клиенте по его ID */
async function getInfoClient(id) {
  const response = await fetch( `${CRM_URL}/api/clients/${id}`, {
    method: 'GET'
  })
  const client = await response.json();

  return client;
}
/* ---------------------------------------------------------------------------- */

/* createClientPage() функция создания карточки клиента */
async function createClientPage(){
  const id = Number(document.location.search.slice(11));
  const client = await getInfoClient(id);

  if(client){
    document.querySelector('.client-container').classList.remove('loading');
  }
  else {
    window.location.replace("404.html");
  }

  const fullName = document.querySelector('.client__full-name');

  const dateCreation = document.querySelector('.client__date-creation');
    const dateCreationTime = document.querySelector('.client__date-creation-time');

  const dateLastEdit = document.querySelector('.client__date-last-edit');
    const dateLastEditTime = document.querySelector('.client__date-last-edit-time');

  const btnCopyLink = document.querySelector('.btn-copy-link');

  const contactsList = document.querySelector('.contacts__list');

  /* Наполнение контентом */
  fullName.textContent = `${client.surname} ${client.name} ${client.lastName}`;

  dateCreation.textContent = `Дата создания: ${new Date(Date.parse(client.createdAt)).toLocaleDateString()}`;
    dateCreationTime.textContent = `${new Date(Date.parse(client.createdAt)).toLocaleTimeString().slice(0,-3)}`;

  dateLastEdit.textContent = `Последние изменения: ${new Date(Date.parse(client.updatedAt)).toLocaleDateString()}`;
    dateLastEditTime.textContent = `${new Date(Date.parse(client.updatedAt)).toLocaleTimeString().slice(0,-3)}`;

  btnCopyLink.setAttribute('data-link',`${document.location}`);
  btnCopyLink.addEventListener('click',(event) => {
    let link = String(event.currentTarget.dataset.link);
    navigator.clipboard.writeText(link)
    .then(() => {
      document.querySelector('.copy-success').classList.remove('hide');
      setTimeout(()=>{
        document.querySelector('.copy-success').classList.add('hide');
      }, 500)
    })
    .catch(() => {
      document.querySelector('.copy-error').classList.remove('hide');
      setTimeout(()=>{
        document.querySelector('.copy-error').classList.add('hide');
      }, 500)
      console.log('error!');
    })
  });

  if (client.contacts.length > 0){
    client.contacts.forEach(contact => {
      const contactsListItem = document.createElement('li');
        const itemType = document.createElement('span');
        const itemValue = document.createElement('a');

      contactsListItem.classList.add('contacts__list-item', 'd-flex');
        itemType.classList.add('list-item-type','d-flex');
        itemValue.classList.add('list-item-value');
        itemValue.addEventListener('click', (event) => {
          let link = event.currentTarget.textContent;

          navigator.clipboard.writeText(link)
          .then(() => {
            document.querySelector('.copy-success').classList.remove('hide');
            setTimeout(()=>{
              document.querySelector('.copy-success').classList.add('hide');
            }, 500)
          })
          .catch(() => {
            document.querySelector('.copy-error').classList.remove('hide');
            setTimeout(()=>{
              document.querySelector('.copy-error').classList.add('hide');
            }, 500)
            console.log('error!');
          })
        })

        if (contact.type === 'VK') {
          itemType.innerHTML = `${svg.svgVk} ${contact.type}`;
        }
        else if (contact.type === 'Facebook') {
          itemType.innerHTML = `${svg.svgFb} ${contact.type}`;
        }
        else if (contact.type === 'Phone') {
          itemType.innerHTML = `${svg.svgPhone} Телефон`;
        }
        else if (contact.type === 'E-mail') {
          itemType.innerHTML = `${svg.svgEmail} ${contact.type}`;
        }
        else if (contact.type === 'Additional-contact') {
          itemType.innerHTML = `${svg.svgAdditionalContact} ${contact.type}`;
        }
        itemValue.textContent = `${contact.value}`;

      contactsListItem.append(itemType);
      contactsListItem.append(itemValue);
      contactsList.append(contactsListItem);
    })
  }
  else {
    const contactsListItem = document.createElement('li');
    contactsListItem.classList.add('contacts__list-item','no-contacts','d-flex');

    contactsListItem.textContent = 'У клиента нет контактов!';
    contactsList.append(contactsListItem);
  }
  initFrameworks()
}

/* initFrameworks() функция повторной инициализации библиотек для корректной работы */
function initFrameworks() {

  const btnsSocial = document.querySelectorAll('.list-item-value');

  btnsSocial.forEach(btn =>{
    tippy(btn, {
      content: 'Нажмите, чтобы скопировать',
      offset: [0, 5],
      allowHTML: true,
      placement: 'top',
      animation: 'fade',
      theme: 'tooltip-client-contact',
    });
  })
}
/* ---------------------------------------------------------------------------- */

/* initMessages() функция выводить небольшое модальное окно с поддтверждением о копировании ссылки */
function initMessages(){
  document.querySelector('.copy-success').classList.remove('d-none');
  document.querySelector('.copy-error').classList.remove('d-none');
  document.querySelector('.copy-success').classList.add('d-flex');
  document.querySelector('.copy-error').classList.add('d-flex');
}
/* ---------------------------------------------------------------------------- */

/* ОБРАБОТЧИКИ СОБЫТИЙ */
const btnBackPage = document.querySelector('.btn-back-page');
btnBackPage.addEventListener('click', () => {
  history.back();
})
/* ---------------------------------------------------------------------------- */

window.onload = async function() {
  createClientPage();
  initMessages();
}