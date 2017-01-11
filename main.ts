import * as Fuse from 'fuse.js';

let books = [{
    title: "Old Man's War",
    author: {
        firstName: 'John',
        lastName: 'Scalzi'
    }
}];
let fuse = new Fuse(books, { keys: ['title', 'author.firstName'] });

window.alert(Object.keys(fuse).map(key => `${key}: ${fuse[key]}`));