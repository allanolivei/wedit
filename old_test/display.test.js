

// var assert = require('assert');
// var main = require('../tmp/js/main');

// describe('Testes da classe display', function(){

//     it('2 + 2 deve ser igual a 4', function(){
//         //var human = new Human("Ola Humano");
//         console.log(main.NAME());
//         //assert.equal("Ola Humano", human.getValue());
//         assert.equal(4, 2 + 2);
//     });
// }); 

// describe('Testes da classe widget', function(){

//     it('2 * 2 deve ser igual a 8 (nota 0 em matemática)', function(){
//         assert.equal(8, 2 * 2);
//     });
// }); 
//expect('nav h1').dom.to.contain.text('Chai');
//expect('#node .button').dom.to.have.style('float', 'left');


var chai = require('chai')

//chai.use(chaiWebdriver(driver));
//driver.get('http://chaijs.com/');


const assert = chai.assert;
const expect = chai.expect;
chai.use(require('chai-dom'))

// document.getElementById('header').should.have.attr('foo')
// expect(document.querySelector('main article')).to.have.attribute('foo', 'bar')
// expect(document.querySelector('main article')).to.have.attr('foo').match(/bar/)
// document.getElementsByName('bar').should.have.class('foo')
// expect(document.querySelector('main article')).to.have.class('foo')
// document.querySelector('.name').should.have.html('<em>John Doe</em>')
// expect(document.querySelector('#title')).to.have.html('Chai Tea')
//document.querySelector('.name').should.contain.html('<span>Doe</span>')
//expect(document.querySelector('#title')).to.contain.html('<em>Tea</em>')


//var user = {name: 'Scott'};
//expect(user).to.have.property('name'); var expect = require('chai').expect;

// Simple assertions
// expect({}).to.exist;  
// expect(26).to.equal(26);  
// expect(false).to.be.false;  
// expect('hello').to.be.string;
// // Modifiers ('not')
// expect([1, 2, 3]).to.not.be.empty;
// // Complex chains
// expect([1, 2, 3]).to.have.length.of.at.least(3);  

describe('Test', function() {
    it('test', function() {
        //assert.ok(true);
        console.log(document);
        console.log(window);
        expect("div>h1").do
    });
});