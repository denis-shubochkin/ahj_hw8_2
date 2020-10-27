import circ from '../pic/empt.png';


const inputName = document.querySelector('.input-name');
const enterForm = document.querySelector('.enter');
const enterBut = document.querySelector('.enter-button');
const main = document.querySelector('.main-widget');
const side = document.querySelector('.users');
let usersEl = document.querySelectorAll('.user');
const inputMes = document.querySelector('.input-message');
const chat = document.querySelector('.chat');
let users;
let myName;

function postUser(user) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:7070/users');
  xhr.send(user);
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = xhr.responseText;
        console.log(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
}

function delUser() {
  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', 'http://localhost:7070/users');
  xhr.send(myName);
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = xhr.responseText;
        console.log(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
}

function updateUsers() {
  users.forEach((element) => {
    //   <div class="user">
    //   <img class="circle" src="./pic/empt.png">
    //   <span class="user-name">Maria</span>
    // </div>
    const newUser = document.createElement('div');
    newUser.classList.add('user');
    side.appendChild(newUser);
    const circle = document.createElement('img');
    circle.classList.add('circle');
    circle.src = circ;
    newUser.appendChild(circle);
    const userName = document.createElement('span');
    userName.classList.add('user-name');
    userName.textContent = element;
    newUser.appendChild(userName);
  });
  const newUser = document.createElement('div');
  newUser.classList.add('user');
  side.appendChild(newUser);
  const circle = document.createElement('img');
  circle.classList.add('circle');
  circle.src = circ;
  newUser.appendChild(circle);
  const userName = document.createElement('span');
  userName.classList.add('user-name');
  userName.classList.add('my');
  userName.textContent = 'You';
  newUser.appendChild(userName);
}
function showChat() {
  enterForm.style.display = 'none';
  main.style.display = 'block';
  side.style.display = 'block';
  updateUsers();
}


function clearUsers() {
  users = [];
  usersEl = document.querySelectorAll('.user');
  usersEl.forEach((el) => el.remove());
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:7070/users');
  xhr.send();
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        users = data;
        updateUsers();
      } catch (e) {
        console.error(e);
      }
    }
  });
}

function openChat() {
  const ws = new WebSocket('ws://localhost:7070/ws');
  ws.binaryType = 'blob';
  ws.addEventListener('open', () => {
    console.log('connected');
  });

  inputMes.addEventListener('keyup', (e) => {
    if (e.keyCode === 13 && inputMes.value !== '') {
      if (ws.readyState === WebSocket.OPEN) {
        const date = new Date().toLocaleString();
        const o = { name: myName, date, mess: inputMes.value };
        ws.send(JSON.stringify(o));
        inputMes.value = '';
      }
    }
  });


  ws.addEventListener('message', (evt) => {
    console.log(evt.data);
    if (evt.data === 'delUser') {
      console.log(users);
      clearUsers();
      return;
    }
    const el = JSON.parse(evt.data);
    //    console.log(el)
    //    if(el===1001)
    //    {
    //      console.log('1')
    //    }
    if (el.mess === '/exit') {
      delUser();
      ws.send('delUser');

      return;
    }
    if (el.name === myName) {
      const newMess = document.createElement('div');
      newMess.classList.add('message');
      newMess.classList.add('my');
      chat.appendChild(newMess);
      const nameDate = document.createElement('div');
      nameDate.classList.add('name-date');
      newMess.appendChild(nameDate);
      const name = document.createElement('span');
      name.classList.add('name');
      name.textContent = 'You, ';
      nameDate.appendChild(name);
      const date = document.createElement('span');
      date.classList.add('date');
      date.textContent = el.date;
      nameDate.appendChild(date);
      const text = document.createElement('div');
      text.classList.add('text');
      text.textContent = el.mess;
      newMess.appendChild(text);
    } else {
      const newMess = document.createElement('div');
      newMess.classList.add('message');
      chat.appendChild(newMess);
      const nameDate = document.createElement('div');
      nameDate.classList.add('name-date');
      newMess.appendChild(nameDate);
      const name = document.createElement('span');
      name.classList.add('name');
      name.textContent = `${el.name}, `;
      nameDate.appendChild(name);
      const date = document.createElement('span');
      date.classList.add('date');
      date.textContent = el.date;
      nameDate.appendChild(date);
      const text = document.createElement('div');
      text.classList.add('text');
      text.textContent = el.mess;
      newMess.appendChild(text);
    }
  });
  ws.addEventListener('close', (evt) => {
    console.log('connection closed', evt);
  });
  ws.addEventListener('error', () => {
    console.log('error');
  });

  window.onbeforeunload = function () {
    ws.close(1005, '123');
  };
}


enterBut.addEventListener('click', (evt) => {
  evt.preventDefault();
  if (inputName.value !== '') {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:7070/users');
    xhr.send();
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.includes(inputName.value)) {
            alert('Пользователь уже есть');
            inputName.value = '';
          } else {
            users = data;
            postUser(inputName.value);
            myName = inputName.value;
            openChat();
            showChat();
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  }
});
