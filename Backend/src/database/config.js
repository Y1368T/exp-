module.exports = {
  development: {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '', // Leave empty if no password
    database: 'todo_list',
  },
  test: {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '', // Leave empty if no password
    database: 'test_todo_list',
  },
};
