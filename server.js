const http = require('http'); // модуль для создания сервера
const fs = require('fs'); // модуль для работы с файлами

const PORT = 8080;
const USER_FILE = 'user.txt';
const DATA_FILE = 'data.txt';

// создание файлов при запуске
fs.writeFile(USER_FILE, '', (err) => {
  if
    (err) console.error('Error creating user.txt:', err)
  else
  console.log('File user.txt created.');
});

fs.writeFile(DATA_FILE, JSON.stringify([...Array(20)].map((_, i) => ({
  id: i + 1,
  name: `User${i + 1}`,
  age: Math.floor(Math.random() * 100) + 1
})), null, 2), (err) => {
  if
    (err) console.error('Error creating data.txt:', err);
  else
    console.log('File data.txt created.');
});
// null — не изменяет структуру JSON
// 2 - отступы 


const server = http.createServer((req, res) => { // req - это запрос, res - это ответ

  if (req.url === '/user') {
  if (req.method === 'GET') {
    fs.readFile(USER_FILE, 'utf-8', (err, data) => res.end(err || data));
    // utf-8 - кодировка, в которой нужно прочитать файл; 
    // end - метод, который завершает ответ
    }
    
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
      // on - метод, который слушает событие; 
      // data - событие, которое происходит, когда приходят данные; 
      // chunk - данные, которые пришли в запросе
    req.on('end', () => {
      // end - событие, которое происходит, когда пришли все данные
      fs.appendFile(USER_FILE, body + '\n', (err) => res.end(err || 'Data has been written'));
    });
    // appendFile - метод, который добавляет данные в файл
    // '\n' - символ переноса строки
  }
  }

  if (req.url === '/data') {
    if (req.method === 'GET') {
      fs.readFile(DATA_FILE, 'utf-8', (err, data) => res.end(err || data));
    }

    // Добавить новый
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
          if (err) return res.end(JSON.stringify({ error: err.message }));

          let arr = JSON.parse(data); // строка JSON в массив объектов
          const newItem = { id: arr.length ? arr[arr.length - 1].id + 1 : 1, ...JSON.parse(body) };
          arr.push(newItem); 
          // arr.length - 1 - индекс последнего элемента (+1 новый)
          // если пустой, то создаётся 1
          // push - добавляет новый в конец массива
          // body - то, что передаётся

          // Перезапись с новыми данными
          fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), (err) => 
            res.end(err ? JSON.stringify({ error: err.message }) : JSON.stringify({ message: 'Object added', object: newItem }))
          );
        });
      });
    }

    // Полностью обновить
   if (req.method === 'PUT') {
      let body = '';
      req.on('data', (chunk) => body += chunk);
      req.on('end', () => {
        fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
          if (err) return res.end(JSON.stringify({ error: err.message }));

          let arr = JSON.parse(data);
          const updatedItem = JSON.parse(body);
          const index = arr.findIndex(obj => obj.id === updatedItem.id);
          // findIndex - ищет индекс объекта с id, который нужно обновить
          if (index === -1) return res.end(JSON.stringify({ error: 'Object not found' }));

          arr[index] = updatedItem; //  заменяет объект в массиве
          fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), (err) =>
            res.end(err ? JSON.stringify({ error: err.message }) : JSON.stringify({ message: 'Object updated', object: updatedItem }))
          );
        });
      });
    }

    // Частично обновить
    if (req.method === 'PATCH') {
      let body = '';
      req.on('data', (chunk) => body += chunk);
      req.on('end', () => {
        fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
          if (err) return res.end(JSON.stringify({ error: err.message }));

          let arr = JSON.parse(data);
          const patchedItem = JSON.parse(body);
          const index = arr.findIndex(obj => obj.id === patchedItem.id);

          if (index === -1) return res.end(JSON.stringify({ error: 'Object not found' }));

          arr[index] = { ...arr[index], ...patchedItem };
          // spread (...), чтобы обновить только переданные поля

          fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), (err) =>
            res.end(err ? JSON.stringify({ error: err.message }) : JSON.stringify({ message: 'Object patched', object: arr[index] }))
          );
        });
      });
    }

    if (req.method === 'DELETE') {
      let body = '';
      req.on('data', (chunk) => body += chunk);
      req.on('end', () => {
        fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
          if (err) return res.end(JSON.stringify({ error: err.message }));

          let arr = JSON.parse(data);
          const { id } = JSON.parse(body);
          const newArr = arr.filter((item) => item.id !== id);
          // filter() создаёт новый массив, исключая объект с переданным id

          if (arr.length === newArr.length) return res.end(JSON.stringify({ error: 'Object not found' }));

          fs.writeFile(DATA_FILE, JSON.stringify(newArr, null, 2), (err) =>
            res.end(err ? JSON.stringify({ error: err.message }) : JSON.stringify({ message: 'Object deleted', id }))
          );
        });
      });
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
// listen - метод, который запускает сервер на определённом порту