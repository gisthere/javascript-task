'use strict';

module.exports.execute = execute;
module.exports.isStar = true;

function execute() {
    // Внутри этой функции нужно получить и обработать аргументы командной строки
    const args = process.argv;

    return Promise.resolve('Это строка будет выведена на консоль');
}
