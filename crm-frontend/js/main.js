import * as svg from './svg.js';

document.addEventListener('DOMContentLoaded', function(){
  const CRM_URL = 'http://localhost:3000';
  let countContact = 0;
  let parentId;

  /* СЕРВЕРНЫЕ ФУНКЦИИ -----------------*/

    /* loadInfo() функция получение данных с сервера */
    async function loadInfo() {
      const response = await fetch( `${CRM_URL}/api/clients`, {
        method: 'GET'
      })

      if (response.ok) {
        const data = await response.json();

        return data;
      }
      else console.log('что-то пошло не так');

    }
    /* ---------------------------------------------------------------------------- */

    /* createClientInfo() функция создания клиента, добавления на сервер и в базу данных */
    async function createClientInfo(newClientObj){
      const response = await fetch (`${CRM_URL}/api/clients`, {
        method: 'POST',
        headers: {'Content-Type': 'applicatinon/json'},
        body: JSON.stringify(newClientObj)
      })
      if (response.ok) {
        window.location.reload();
      }
      else console.log('что-то пошло не так');
    }
    /* ---------------------------------------------------------------------------- */

    /* deleteClientInfo() функция удаления информации о клиенте из базы данных */
    async function deleteClientInfo(id) {
      const response = await fetch(`${CRM_URL}/api/clients/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        window.location.reload();
      }
      else console.log('что-то пошло не так');
    }
    /* ---------------------------------------------------------------------------- */

    /* changeClientInfo() функция изменения информации о клиенте в базе данных */
    async function changeClientInfo(clientObj, id){
      const response = await fetch (`${CRM_URL}/api/clients/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'applicatinon/json'},
        body: JSON.stringify(clientObj)
      })
      if (response.ok) {
        window.location.reload();
      }
      else console.log('что-то пошло не так');
    }
    /* ---------------------------------------------------------------------------- */

    /* getInfoClient() функция получения информации о клиенте по его ID */
    async function getInfoClient(id) {
      const response = await fetch( `${CRM_URL}/api/clients/${id}`, {
        method: 'GET'
      })
      const client = await response.json();

      return client;
    }
    /* ---------------------------------------------------------------------------- */

    /* loadingPage функция для отображения загрузки главной таблицы */
    async function loadingPage() {
      const table = document.querySelector('.clients__table.table');
      const tableBody = document.getElementById('clients-list'); // для реализации загрузки

      tableBody.classList.add('loading');

      let response = await fetch(`${CRM_URL}/api/clients`, {
        method: 'GET'
      })

      if (response.ok) {
        table.classList.remove('height');
        tableBody.classList.remove('loading');
        return true
      }
      else {
        console.log('NO');
        table.classList.remove('height');
        tableBody.classList.remove('loading');
        return false
      }

    }
    /* ---------------------------------------------------------------------------- */

    /* loadingPage функция для отображения загрузки на кнопках */
    async function loadingChanges(btn) {
      btn.classList.add('active');
      setTimeout(()=>{
        btn.classList.remove('active');
      },1000);
    }

  /* ---------------------------------------------------------------------------- */


  /* ФУНКЦИИ ПОМОЩНИКИ ---------------------*/

    /* correctData() функция проверки полей на наличие данных и правильность ввода (валидация) */
    function correctData(array) {
      let check = Boolean;

      array.forEach(elem => {
        if (elem.required && elem.value.trim() !== '') {
          elem.classList.remove('error');
          check = true;
        }
        else if(!elem.required) {
          elem.classList.remove('error');
        }
        else {
          elem.classList.add('error');
          check = false;
        }
      })
      return check

    }
    /* ---------------------------------------------------------------------------- */

    /* clear() функция отчистки полей после создания */
    function clear(array, selectContainers) {
      array.forEach(elem => {
        elem.value = '';
        elem.classList.remove('error');
        elem.nextSibling.nextElementSibling.classList.remove('focus');
      })

      if (selectContainers.length !== 0){
        selectContainers[0].previousSibling.previousSibling.classList.remove('p-25');
        selectContainers[0].parentNode.classList.remove('pt-25');
        selectContainers.forEach(container => {
          container.remove();
        })
      }
    }
    /* ---------------------------------------------------------------------------- */

    /* initFrameworks() функция повторной инициализации библиотек для корректной работы */
    function initFrameworks() {
      /* selects */
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
      /* ---------------------------------------------------------------------------- */

      /* tooltips (tippy.js) */
      const btns = document.querySelectorAll('.btn-delete-contact');
      btns.forEach(btn =>{
        tippy(btn, {
          content: 'Удалить контакт',
          placement: 'top',
          animation: 'fade',
          theme: 'tooltip-delete-btn',
        });
      })

      const btnsSocial = document.querySelectorAll('.clients__table-social');
      btnsSocial.forEach(btn =>{
        tippy(btn, {
          interactive: true,
          allowHTML: true,
          placement: 'top',
          animation: 'fade',
          theme: 'tooltip-template',
        });
      })
      /* ---------------------------------------------------------------------------- */
    }

    /* deleteErrors() функция удаления ошибок после закрытия модального окна */
    function deleteErrors() {
      const inputs = document.querySelectorAll('.new-client__input');

      inputs.forEach(input=>{
        input.classList.remove('error');
      })

      /* скрываю ошибку, если был удален контакт и кол-во контактов > 10 */
      document.querySelectorAll('.contact-error').forEach(elem => {
        elem.classList.add('d-none');
      });

      document.querySelectorAll('.add-contact-btn').forEach(btn => {
        btn.removeAttribute('disable');
        btn.classList.remove('disable');
      })

      /* удаление margin-bottom у контейнера с кнопкой добавления контакта (нужно для PixelPerfect)  */
      document.querySelectorAll('.add-new-contact').forEach(body => {
        body.classList.remove('m-b-8');
      })
    }
  /* ---------------------------------------------------------------------------- */


  /* ФУНКЦИИ ВЗАИМОДЕЙСТВУЮЩИЕ С HTML -------------*/

    /* createTableHtml() функция отрисовки HTML и добавление клиента */
    async function createTableHtml(data){
      const newClientInputs = document.querySelectorAll('.new-client__input');

      /* для корректного смещения placeholder'a наверх */
      newClientInputs.forEach(input => {
        input.addEventListener('input', ()=>{
          if (input.value !== '') {
            input.nextSibling.nextElementSibling.classList.add('focus');
          }
          else input.nextSibling.nextElementSibling.classList.remove('focus');
        })
      })

      /* вызов функции отрисовки клиентов */
      data.forEach(elem => {
        createRowClient(elem);
      })

      /* обработчик событий для кнопок удаления клиента */
      const deleteBtnsClients = document.querySelectorAll('.clients__table_delete');

      deleteBtnsClients.forEach(btn => {
        btn.addEventListener('click', async (event)=>{
          await loadingChanges(btn);
          parentId = Number(event.currentTarget.parentNode.parentNode.parentNode.dataset.targetId);
        })
      })

      /* обработчик событий для кнопок изменить клиента */
      const changeBtnsClients = document.querySelectorAll('.clients__table_change');

      changeBtnsClients.forEach(btn => {
        btn.addEventListener('click', async (event)=>{
          await loadingChanges(btn);

          parentId = Number(event.currentTarget.parentNode.parentNode.parentNode.dataset.targetId);
          let client = await getInfoClient(parentId);

          modalWindowChangeInfo(client);
        })
      })
    }
    /* ---------------------------------------------------------------------------- */

    /* createRowClient() функция отрисовки строки нового клиента. Принимает в себя объект с данными */
    function createRowClient(obj) {
      const tableBody = document.getElementById('clients-list'); // для отрисовки внутри таблицы
      let tr = document.createElement('tr');
      let tdId = document.createElement('td');
      let tdFio = document.createElement('td');
        let clientLink = document.createElement('a');

      let tdCreateDate = document.createElement('td');
        let createDateContainer = document.createElement('div');
          let createDate = document.createElement('p');
          let createTime = document.createElement('span');

      let tdChangeDate = document.createElement('td');
        let changeDateContainer = document.createElement('div');
          let changeDate = document.createElement('p');
          let changeTime = document.createElement('span');

      let tdContacts = document.createElement('td');
        let contactList = document.createElement('ul');


      let tdActions = document.createElement('td');

      const actionsBtnContainerHtml = `
        <div class="column-actions__btn-container">
          <button class="clients__table_change btn" type="button" data-bs-toggle="modal" data-bs-target="#changeClientInfo">
            <span></span>Изменить
          </button>
          <button class="clients__table_delete btn" type="button" data-bs-toggle="modal" data-bs-target="#deleteClient">
          <span></span>Удалить
          </button>
        </div>
      `

      /* присваение классов, атрибутов и т.п. */
      tr.classList.add('clients__table-row');

      tdId.classList.add('clients__table-column', 'column-id', 'small-descr');
      tdFio.classList.add('clients__table-column', 'column-fio');
        clientLink.classList.add('clients__table-link');
        clientLink.setAttribute('href',`client.html?client-id=${obj.id}`);

      tdCreateDate.classList.add('clients__table-column', 'column-createData');
        createDateContainer.classList.add('data-container', 'd-flex');
          createDate.classList.add('data');
          createTime.classList.add('time');

      tdChangeDate.classList.add('clients__table-column', 'column-lastChanges');
        changeDateContainer.classList.add('data-container', 'd-flex');
          changeDate.classList.add('data');
          changeTime.classList.add('time');

      tdContacts.classList.add('clients__table-column', 'column-contacts');
        contactList.classList.add('clients__table_list', 'd-flex');

      tdActions.classList.add('clients__table-column', 'column-actions');

      /* наполнение контентом */
      let date = new Date(Date.parse(obj.createdAt)).toLocaleDateString();
      let time = new Date(Date.parse(obj.createdAt)).toLocaleTimeString().slice(0,-3);
      let lastChangesDate = new Date(Date.parse(obj.updatedAt)).toLocaleDateString();
      let lastChangesTime = new Date(Date.parse(obj.updatedAt)).toLocaleTimeString().slice(0,-3);

      tdId.textContent = (obj.id.slice(0,6));
      clientLink.textContent = (`${obj.surname} ${obj.name} ${obj.lastName}`);

      createDate.textContent = date;
      createTime.textContent = time;
      changeDate.textContent = lastChangesDate;
      changeTime.textContent = lastChangesTime;

      if (obj.contacts.length > 5){
        for (let i = 0; obj.contacts.length > i; i++){
          let contactListItem = document.createElement('li');
          let itemBtn = document.createElement('button');

          contactListItem.classList.add('clients__table_item', 'd-flex');
          itemBtn.classList.add('clients__table-social','btn');
          itemBtn.setAttribute('type','button');

          if (i < 4) {
            if (obj.contacts[i].type === 'VK') {
              itemBtn.innerHTML = svg.svgVk;
              itemBtn.setAttribute('data-tippy-content',`VK: <a href="https://${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
            }
            else if (obj.contacts[i].type === 'Facebook') {
              itemBtn.innerHTML = svg.svgFb;
              itemBtn.setAttribute('data-tippy-content',`Facebook: <a href="https://${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
            }
            else if (obj.contacts[i].type === 'Phone') {
              itemBtn.innerHTML = svg.svgPhone;
              itemBtn.setAttribute('data-tippy-content',`Телефон: <strong>${obj.contacts[i].value}</strong>`);
            }
            else if (obj.contacts[i].type === 'E-mail') {
              itemBtn.innerHTML = svg.svgEmail;
              itemBtn.setAttribute('data-tippy-content',`E-mail: <a href="mailto:${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
            }
            else if (obj.contacts[i].type === 'Additional-contact') {
              itemBtn.innerHTML = svg.svgAdditionalContact;
              itemBtn.setAttribute('data-tippy-content',`Другое: <strong>${obj.contacts[i].value}</strong>`);
            }

            contactListItem.append(itemBtn);
            contactList.append(contactListItem);
          }
          else if (i === 4) {
            let spanCount = document.createElement('span');
            spanCount.classList.add('social-count','d-flex');
            itemBtn.classList.add('social-btn-more');
            itemBtn.classList.remove('clients__table-social');

            spanCount.textContent = (`+${obj.contacts.length - 4}`);

            itemBtn.append(spanCount);
            contactListItem.append(itemBtn);
            contactList.append(contactListItem);

            /* функция отрисовки дополнительных контактов по нажатию */
            itemBtn.addEventListener('click',(event) => {
              const listItemsHide = event.currentTarget.parentNode.parentNode.childNodes;

              listItemsHide.forEach(item => {
                if (item.classList.contains('d-none')){
                  item.classList.remove('d-none');
                  event.currentTarget.classList.remove('social-btn-more');
                  itemBtn.classList.add('clients__table-social');

                  if (obj.contacts[i].type === 'VK') {
                    itemBtn.innerHTML = svg.svgVk;
                    itemBtn.setAttribute('data-tippy-content',`VK: <a href="https://${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
                  }
                  else if (obj.contacts[i].type === 'Facebook') {
                    itemBtn.innerHTML = svg.svgFb;
                    itemBtn.setAttribute('data-tippy-content',`Facebook: <a href="https://${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
                  }
                  else if (obj.contacts[i].type === 'Phone') {
                    itemBtn.innerHTML = svg.svgPhone;
                    itemBtn.setAttribute('data-tippy-content',`Телефон: <strong>${obj.contacts[i].value}</strong>`);
                  }
                  else if (obj.contacts[i].type === 'E-mail') {
                    itemBtn.innerHTML = svg.svgEmail;
                    itemBtn.setAttribute('data-tippy-content',`E-mail: <a href="mailto:${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
                  }
                  else if (obj.contacts[i].type === 'Additional-contact') {
                    itemBtn.innerHTML = svg.svgAdditionalContact;
                    itemBtn.setAttribute('data-tippy-content',`Другое: <strong>${obj.contacts[i].value}</strong>`);
                  }
                  initFrameworks();
                }
                else if (!item.classList.contains('d-none')){
                  item.classList.add('mb-7');
                }
              })
            })
          }
          else if (i > 4) {
            if (obj.contacts[i].type === 'VK') {
              itemBtn.innerHTML = svg.svgVk;
              itemBtn.setAttribute('data-tippy-content',`VK: <a href="https://${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
            }
            else if (obj.contacts[i].type === 'Facebook') {
              itemBtn.innerHTML = svg.svgFb;
              itemBtn.setAttribute('data-tippy-content',`Facebook: <a href="https://${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
            }
            else if (obj.contacts[i].type === 'Phone') {
              itemBtn.innerHTML = svg.svgPhone;
              itemBtn.setAttribute('data-tippy-content',`Телефон: <strong>${obj.contacts[i].value}</strong>`);
            }
            else if (obj.contacts[i].type === 'E-mail') {
              itemBtn.innerHTML = svg.svgEmail;
              itemBtn.setAttribute('data-tippy-content',`E-mail: <a href="mailto:${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
            }
            else if (obj.contacts[i].type === 'Additional-contact') {
              itemBtn.innerHTML = svg.svgAdditionalContact;
              itemBtn.setAttribute('data-tippy-content',`Другое: <strong>${obj.contacts[i].value}</strong>`);
            }

            contactListItem.append(itemBtn);
            contactListItem.classList.add('d-none');

            contactList.append(contactListItem);
          }

        }
      }
      else {
        for (let i = 0; obj.contacts.length > i; i++){

          let contactListItem = document.createElement('li');
          let itemBtn = document.createElement('button');

          contactListItem.classList.add('clients__table_item', 'd-flex');
          itemBtn.classList.add('clients__table-social','btn');
          itemBtn.setAttribute('type','button');

          if (obj.contacts[i].type === 'VK') {
            itemBtn.innerHTML = svg.svgVk;
            itemBtn.setAttribute('data-tippy-content',`VK: <a href="https://${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
          }
          else if (obj.contacts[i].type === 'Facebook') {
            itemBtn.innerHTML = svg.svgFb;
            itemBtn.setAttribute('data-tippy-content',`Facebook: <a href="https://${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
          }
          else if (obj.contacts[i].type === 'Phone') {
            itemBtn.innerHTML = svg.svgPhone;
            itemBtn.setAttribute('data-tippy-content',`Телефон: <strong>${obj.contacts[i].value}</strong>`);
          }
          else if (obj.contacts[i].type === 'E-mail') {
            itemBtn.innerHTML = svg.svgEmail;
            itemBtn.setAttribute('data-tippy-content',`E-mail: <a href="mailto:${obj.contacts[i].value}" class="contact-link">${obj.contacts[i].value}</a>`);
          }
          else if (obj.contacts[i].type === 'Additional-contact') {
            itemBtn.innerHTML = svg.svgAdditionalContact;
            itemBtn.setAttribute('data-tippy-content',`Другое: <strong>${obj.contacts[i].value}</strong>`);
          }

          contactListItem.append(itemBtn);
          contactList.append(contactListItem);
        }
      }
      tr.setAttribute('data-target-id',`${obj.id}`);

      // добавление в дом дерево
      changeDateContainer.append(
        changeDate,
        changeTime
      );

      createDateContainer.append(
        createDate,
        createTime
      );

      tdCreateDate.append(createDateContainer);
      tdChangeDate.append(changeDateContainer);

      tdContacts.append(contactList);
      tdActions.innerHTML = actionsBtnContainerHtml;

      tdFio.append(clientLink);

      tr.append(
        tdId,
        tdFio,
        tdCreateDate,
        tdChangeDate,
        tdContacts,
        tdActions
      )
      tableBody.append(tr);


      // повторная инициализация фреймворков для корректного отображения тултипов и т.п.
      initFrameworks();
    }
    /* ---------------------------------------------------------------------------- */

    /* deleteRowClient() функция удаления строк клиентов. Используется во время отрисовки сортироки */
    function deleteRowClient(){
      const rowClients = document.querySelectorAll('.clients__table-row');

      rowClients.forEach(row => {
        row.remove();
      })
    }
    /* ---------------------------------------------------------------------------- */

    /* addNewClient() функция добавления нового клиента */
    async function addNewClient(){
      const newClientInputs = document.querySelectorAll('.new-client__input');
      let clientsContactsContainer = document.querySelectorAll('.select-container.new-client-modal');
      let newClient = {}; // объект для данных о клиенте, потом передастся в основной массив

      if (correctData(newClientInputs)) {
        let clientsContactsArray = [];
        let contactObj = {
          contactName: String,
          contactValue: String
        };

        for (let i = 0; clientsContactsContainer.length > i; i++) {
          let contactName = document.querySelectorAll('.select.select-custom.choices__input');
          let contactValue = document.querySelectorAll('.modal-input.form-control');

          contactObj = {
            type: contactName[i].firstChild.value,
            value: contactValue[i].value
          }
          clientsContactsArray.push(contactObj);
        }

        newClient = {
          name: `${document.getElementById('input-name').value.trim()}`,
          surname: `${document.getElementById('input-surname').value.trim()}`,
          lastName: `${document.getElementById('input-patronymic').value.trim()}`,
          contacts: clientsContactsArray
        }

        await createClientInfo(newClient);
        clear(newClientInputs, clientsContactsContainer);
      }
    }
    /* ---------------------------------------------------------------------------- */

    /* addContact() функция добавления контактов */
    function addContact(event) {
      event.currentTarget.classList.add('p-25')
      const mainContainer = event.currentTarget.parentNode;
      const containerSelector = document.createElement('div');
      const containerSelectInput = document.createElement('div');
      const selectInput = document.createElement('input');
      const btnDeleteContact = document.createElement('button');

      containerSelector.classList.add('row', 'm-0', 'col-lg-10', 'select-container', `${event.currentTarget.parentNode.className.split(' ')[0]}`);
      containerSelectInput.classList.add('p-0', 'col-lg-8', 'col-sm-8', 'd-flex', 'select-input', 'justify-content-center', 'align-items-center');
      selectInput.classList.add('modal-input', 'form-control');
      btnDeleteContact.classList.add('modal-input-delete-btn', 'btn-delete-contact', 'delete-btn-hide', 'd-flex', 'justify-content-center', 'align-items-center');

      btnDeleteContact.setAttribute('type','button');
      selectInput.setAttribute('type','text');
      selectInput.setAttribute('placeholder','Введите данные контакта');

      selectInput.addEventListener('input', ()=>{
        if (selectInput.value.length > 0) {
          btnDeleteContact.classList.remove('delete-btn-hide');
          selectInput.classList.add('border-right-hide');
        }
        else {
          btnDeleteContact.classList.add('delete-btn-hide');
          selectInput.classList.remove('border-right-hide');
        }
      })

      const htmlSelect = `
        <div class="p-0 col-lg-4 col-sm-4 select">
          <select class="select select-custom" name="select">
            <option value="Phone" id="Phone" selected>Телефон</option>
            <option value="E-mail">E-mail</option>
            <option value="Facebook">Facebook</option>
            <option value="VK">ВКонтакте</option>
            <option value="Additional-contact">Другое</option>
          </select>
        </div>
      `

      btnDeleteContact.addEventListener('click', event =>{
        deleteContact(event);
      });


      btnDeleteContact.innerHTML = svg.svgDeleteContactBtn;
      containerSelectInput.append(selectInput);
      containerSelectInput.append(btnDeleteContact);
      containerSelector.innerHTML = htmlSelect;
      containerSelector.append(containerSelectInput);
      mainContainer.classList.add('pt-25');
      mainContainer.append(containerSelector);
      initFrameworks();
    }
    /* ---------------------------------------------------------------------------- */

    /* deleteContact() функция удаления одного контакта */
    function deleteContact(event){
      --countContact;
      if (countContact === 0) {
        const modalBody = event.currentTarget.parentNode.parentNode.parentNode;
        const btnAdd = event.currentTarget.parentNode.parentNode.parentNode.childNodes[1];

        btnAdd.classList.remove('p-25');
        modalBody.classList.remove('pt-25');
      }
      event.currentTarget.parentNode.parentNode.remove();

      /* скрываю ошибку, если был удален контакт и кол-во контактов > 10 */
      document.querySelectorAll('.contact-error').forEach(elem => {
        elem.classList.add('d-none');
      });

      /* включение кнопок добавления контактов */
      document.querySelectorAll('.add-contact-btn').forEach(btn => {
        btn.removeAttribute('disable');
        btn.classList.remove('disable');
      })

      /* удаление margin-bottom у контейнера с кнопкой добавления контакта (нужно для PixelPerfect)  */
      document.querySelectorAll('.add-new-contact').forEach(body => {
        body.classList.remove('m-b-8');
      })
    }
    /* ---------------------------------------------------------------------------- */

    /* deleteAllContacts() функция удаления всех контактов из модального окна */
    function deleteAllContacts(){
      const modalWindows = document.querySelectorAll('.modal.fade');

      modalWindows.forEach(modalWindow =>{
        if (!modalWindow.classList.contains('.show')){
          const mainContainers = document.querySelectorAll('.add-new-contact');
          const selectContainers = document.querySelectorAll('.select-container');
          const addContactBtns = document.querySelectorAll('.add-contact-btn');

          selectContainers.forEach(container => {
            setTimeout(()=>{
              container.remove();

              countContact = 0;

              addContactBtns.forEach(btn=>{
                btn.classList.remove('p-25')
              });

              mainContainers.forEach(container=>{
                container.classList.remove('pt-25')
              });
            }, 500)
          })
        }
      })
    }
    /* ---------------------------------------------------------------------------- */

    /* addContactModalWindowChange() функция отрисовки контактов в модальном окне "Изменить"*/
    async function addContactModalWindowChange(obj){
      const mainContainer = document.querySelector('.change-client-modal.add-new-contact');
      const btnAddContacts = document.querySelector('.change-modal-add-new-contact-btn');
      const containerSelector = document.createElement('div');
      const containerInput = document.createElement('div');
      const input = document.createElement('input');
      let htmlOption = ``;

      containerSelector.classList.add('row', 'm-0', 'col-lg-10', 'select-container');
      containerInput.classList.add('p-0', 'col-lg-8', 'col-sm-8', 'd-flex', 'select-input', 'justify-content-center', 'align-items-center');
      btnAddContacts.classList.add('p-25');

      input.classList.add('modal-input','form-control','border-right-hide');
      input.setAttribute('type', 'text');
      input.setAttribute('placeholder', 'Введите данные контакта');
      input.value = obj.value;

      if (obj.type === 'Phone') {
        htmlOption = `
          <option value="Phone" selected>Телефон</option>
          <option value="E-mail">E-mail</option>
          <option value="Facebook">Facebook</option>
          <option value="VK">ВКонтакте</option>
          <option value="Additional-contact">Другое</option>
        `
      }
      else if (obj.type === 'E-mail') {
        htmlOption = `
          <option value="Phone">Телефон</option>
          <option value="E-mail" selected>E-mail</option>
          <option value="Facebook">Facebook</option>
          <option value="VK">ВКонтакте</option>
          <option value="Additional-contact">Другое</option>
        `
      }
      else if (obj.type === 'Facebook') {
        htmlOption = `
          <option value="Phone">Телефон</option>
          <option value="E-mail">E-mail</option>
          <option value="Facebook" selected>Facebook</option>
          <option value="VK">ВКонтакте</option>
          <option value="Additional-contact">Другое</option>
        `
      }
      else if (obj.type === 'VK') {
        htmlOption = `
          <option value="Phone">Телефон</option>
          <option value="E-mail">E-mail</option>
          <option value="Facebook">Facebook</option>
          <option value="VK" selected>ВКонтакте</option>
          <option value="Additional-contact">Другое</option>
        `
      }
      else if (obj.type === 'Additional-contact') {
        htmlOption = `
          <option value="Phone">Телефон</option>
          <option value="E-mail">E-mail</option>
          <option value="Facebook">Facebook</option>
          <option value="VK">ВКонтакте</option>
          <option value="Additional-contact" selected>Другое</option>
        `
      }

      const btnDeleteContactHtml = `
        <button class="modal-input-delete-btn btn-delete-contact d-flex justify-content-center align-items-center" type="button">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill="#B0B0B0"/>
          </svg>
        </button>
      `;

      const htmlSelect = `
        <div class="p-0 col-lg-4 col-sm-4 select">
          <select class="select select-custom" name="select">
            ${htmlOption}
          </select>
        </div>
      `;

      containerInput.innerHTML = btnDeleteContactHtml;
      containerInput.prepend(input);

      containerSelector.innerHTML = htmlSelect;
      containerSelector.append(containerInput);

      mainContainer.classList.add('pt-25');
      mainContainer.append(containerSelector);
      initFrameworks();
    }
    /* ---------------------------------------------------------------------------- */

    /* modalWindowChangeInfo() функция отрисовки информации в модальном окне "Изменить" */
    async function modalWindowChangeInfo(obj){
      const modalWindow = document.getElementById('changeClientInfo');
      const id = document.querySelector('.modal-id');
      const surname = document.querySelector('.modal-change-surname');
      const name = document.querySelector('.modal-change-name');
      const lastname = document.querySelector('.modal-change-lastname');
      let contacts = obj.contacts;

      countContact = contacts.length;

      /* наполнение контентом */
      id.textContent = `ID: ${obj.id.slice(0,6)}`
      surname.value = obj.surname;
      name.value = obj.name;
      lastname.value = obj.lastName;
      modalWindow.setAttribute('data-id',`${obj.id}`);

      contacts.forEach(contact => {
        addContactModalWindowChange(contact);
      });

      /* обработчик событий для кнопок удаления контакта */
      const btnsDeleteContact = document.querySelectorAll('.btn-delete-contact');
      btnsDeleteContact.forEach(btn=>{
        btn.addEventListener('click',(event)=>{
          deleteContact(event);
        })
      })
    }
    /* ---------------------------------------------------------------------------- */

    /* сортировка по убыванию */
    async function descendingSort (btn) {
      const data = await loadInfo();
      let marker = btn.dataset.columnBtn;

      if (marker === 'id') {
        data.sort(function (a, b) {
          if (a.id < b.id) {
            return 1;
          }
          if (a.id > b.id) {
            return -1;
          }
          return 0;
        });
        deleteRowClient();
        createTableHtml(data);
      }
      else if (marker === 'fio') {
        data.sort(function (a, b) {
          if (a.surname < b.surname) {
            return 1;
          }
          if (a.surname > b.surname) {
            return -1;
          }
          return 0;
        });
        deleteRowClient();
        createTableHtml(data);
      }
      else if (marker === 'createdAt') {
        data.sort(function (a, b) {
          if (a.createdAt < b.createdAt) {
            return 1;
          }
          if (a.createdAt > b.createdAt) {
            return -1;
          }
          return 0;
        });
        deleteRowClient();
        createTableHtml(data);
      }
      else if (marker === 'updatedAt') {
        data.sort(function (a, b) {
          if (a.updatedAt < b.updatedAt) {
            return 1;
          }
          if (a.updatedAt > b.updatedAt) {
            return -1;
          }
          return 0;
        });
        deleteRowClient();
        createTableHtml(data);
      }

    }
    /* ---------------------------------------------------------------------------- */

    /* сортировка по возрастанию */
    async function ascendingSort (btn) {
      const data = await loadInfo();
      let marker = btn.dataset.columnBtn;

      if (marker === 'id') {
        data.sort(function (a, b) {
          if (a.id > b.id) {
            return 1;
          }
          if (a.id < b.id) {
            return -1;
          }
          return 0;
        });
        deleteRowClient();
        createTableHtml(data);
      }
      else if (marker === 'fio') {
        data.sort(function (a, b) {
          if (a.surname > b.surname) {
            return 1;
          }
          if (a.surname < b.surname) {
            return -1;
          }
          return 0;
        });
        deleteRowClient();
        createTableHtml(data);
      }
      else if (marker === 'createdAt') {
        data.sort(function (a, b) {
          if (a.createdAt > b.createdAt) {
            return 1;
          }
          if (a.createdAt < b.createdAt) {
            return -1;
          }
          return 0;
        });
        deleteRowClient();
        createTableHtml(data);
      }
      else if (marker === 'updatedAt') {
        data.sort(function (a, b) {
          if (a.updatedAt > b.updatedAt) {
            return 1;
          }
          if (a.updatedAt < b.updatedAt) {
            return -1;
          }
          return 0;
        });
        deleteRowClient();
        createTableHtml(data);
      }

    }
    /* ---------------------------------------------------------------------------- */

    /* searchClient() функция для поиска клиентов (и фильтрации) */
    async function searchClient(value){
      const data = await loadInfo();
      const searchResults = document.querySelector('.search-results');
      value = value.toLowerCase().split(' ').join('');

      if (value.length > 0) {
        clearSearchResult();
        data.forEach(client => {
          let sortSurname = client.surname.toLowerCase().split(' ').join('') + client.name.toLowerCase().split(' ').join('') + client.lastName.toLowerCase().split(' ').join('');
          let sortName = client.name.toLowerCase().split(' ').join('') + client.surname.toLowerCase().split(' ').join('') + client.lastName.toLowerCase().split(' ').join('');

          if ((sortSurname.substr(0, value.length) === value) || (sortName.substr(0, value.length) === value)){

            searchResults.classList.remove('d-none');
            searchResults.classList.add('d-flex');

            createSearchResult(client);
          }
        })
      }
      else {
        searchResults.classList.add('d-none');
        searchResults.classList.remove('d-flex');

        document.querySelectorAll('.clients__table-row').forEach(function(tabContent){
          tabContent.classList.remove('selected-client');
        });

        clearSearchResult();
      }
    }
    /* ---------------------------------------------------------------------------- */

    /* createSearchResult() функция для отрисовки результата поиска */
    function createSearchResult(obj) {
      const searchResults = document.querySelector('.search-results');
      const clientBtn = document.createElement('button');

      clientBtn.classList.add('search-results__client');
      clientBtn.setAttribute('data-path-id',`${obj.id}`);
      clientBtn.textContent = `${obj.surname} ${obj.name} ${obj.lastName}`

      clientBtn.addEventListener('click', event =>{
        const path = event.currentTarget.dataset.pathId;

        document.querySelectorAll('.clients__table-row').forEach(function(tabContent){
          tabContent.classList.remove('selected-client');
        });

        document.querySelector(`[data-target-id="${path}"]`).classList.add('selected-client');
      })

      searchResults.append(clientBtn);
    }
    /* ---------------------------------------------------------------------------- */

    /* clearSearchResult() функция отчистки поля поиска */
    function clearSearchResult() {
      const searchResultClients = document.querySelectorAll('.search-results__client');

      searchResultClients.forEach(client => {
        client.remove();
      })
    }
  /* ---------------------------------------------------------------------------- */


  /* ОБРАБОТЧИКИ СОБЫТИЙ */
    /* обработчик событий для кнопки удаления клиента */
    const deleteBtnMain = document.querySelector('.modal-btn-delete-client');

    deleteBtnMain.addEventListener('click', ()=>{
      deleteClientInfo(parentId);
    })
    /* ---------------------------------------------------------------------------- */

    /* обработчик событий для кнопки сохранения клиента */
    const saveNewClientBtn = document.querySelector('.new-client__save'); // кнопка сохранить клиента

    saveNewClientBtn.addEventListener('click', async () =>{
      await loadingChanges(saveNewClientBtn);
      await addNewClient();
    });
    /* ---------------------------------------------------------------------------- */

    /* обработчик событий для кнопок добавить контакт */
    const btnsAddContact = document.querySelectorAll('.add-contact-btn');

    btnsAddContact.forEach(btn => {
      btn.addEventListener('click', (event)=>{
        countContact++;
        if (countContact <= 10 ){
          addContact(event);
        }
        else {
          btn.setAttribute('disable', 'disable');
          btn.classList.add('disable');

          document.querySelectorAll('.contact-error').forEach(elem => {
            elem.classList.remove('d-none');
          });

          document.querySelectorAll('.add-new-contact').forEach(body => {
            body.classList.add('m-b-8');
          })

          countContact = 10;
        }
      });
    })
    /* ---------------------------------------------------------------------------- */

    /* обработчик событий для кнопок закрытия модального окна */
    const btnsClose = document.querySelectorAll('[data-bs-dismiss="modal"]');

    btnsClose.forEach(btn => {
      btn.addEventListener('click', ()=>{
        deleteAllContacts();
        deleteErrors();
        document.getElementById('changeClientInfo').removeAttribute('data-id');
      })
    })

    window.addEventListener('click', (event)=>{
      if(event.target.classList.contains('fade')){
        if (!event.target.classList.contains('show')) {
          deleteAllContacts();
          deleteErrors();
          document.getElementById('changeClientInfo').removeAttribute('data-id');
        }
      }
    })
    /* ---------------------------------------------------------------------------- */

    /* обработчик событий для кнопи сохранения измененной информации о клиенте */
    const btnSaveChangeInfo = document.querySelector('.modal-btn-save');

    btnSaveChangeInfo.addEventListener('click',() => {
      let id = Number(document.querySelector('.change-client').dataset.id);
      let contactsName = document.querySelectorAll('.select.select-custom.choices__input');
      let contactsValue = document.querySelectorAll('.modal-input.form-control');
      let clientObj = {};
      let clientsContactsArray = [];
      let contactObj = {
        contactName: String,
        contactValue: String
      };

      for (let i = 0; contactsName.length > i; i++) {
        contactObj = {
          type: contactsName[i].firstChild.value,
          value: contactsValue[i].value
        }
        clientsContactsArray.push(contactObj);
      }

      clientObj = {
        name: `${document.querySelector('.modal-change-name').value.trim()}`,
        surname: `${document.querySelector('.modal-change-surname').value.trim()}`,
        lastName: `${document.querySelector('.modal-change-lastname').value.trim()}`,
        contacts: clientsContactsArray
      }

      changeClientInfo(clientObj, id);
    })
    /* ---------------------------------------------------------------------------- */

    /* обработчик событий для кнопок сортировки (по id, по ФИО, дате создания и т.п.) */
    const btnsFilter = document.querySelectorAll('.clients__table_filter-btn');

    btnsFilter.forEach(btn => {
      btn.addEventListener('click',(event)=>{
        if (event.currentTarget.classList.contains('ascending')) {
          btnsFilter.forEach(btn => {
            btn.classList.remove('ascending');
            btn.classList.remove('descending');
          });

          event.currentTarget.classList.remove('ascending');
          event.currentTarget.classList.add('descending');
          descendingSort(event.currentTarget);

        }
        else {
          btnsFilter.forEach(btn => {
            btn.classList.remove('ascending');
            btn.classList.remove('descending');
          });

          event.currentTarget.classList.remove('descending');
          event.currentTarget.classList.add('ascending');
          ascendingSort(event.currentTarget);

        }
      })
    })
    /* ---------------------------------------------------------------------------- */

    /* обработчик событий для инпута (при вводе поиска) */
    const searchInput = document.querySelector('.header__input');

    searchInput.addEventListener('input', (event) => {
      let value = event.currentTarget.value;

      setTimeout(()=>{
        searchClient(value);
      }, 300)
    })
    /* ---------------------------------------------------------------------------- */
  /* ---------------------------------------------------------------------------- */


  window.onload = async function() {
    const data = await loadInfo();
    const loading = await loadingPage();

    if (loading === true){
      createTableHtml(data);
      document.querySelector('[data-column-btn="id"]').classList.add('ascending');
      ascendingSort(document.querySelector('[data-column-btn="id"]'));
    }
    else {
      createTableHtml(data);
    }
  }
});