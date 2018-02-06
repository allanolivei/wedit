var assert = chai.assert;
var should = chai.should;
var expect = chai.expect;

// https://github.com/nathanboktae/chai-dom


describe('Display', function() 
{

  it('Configuração de tagName e className via construtor', function() 
  {
    let display = new W.Display("div");
    let displayP = new W.Display("p", "p-1");
    let displayA = new W.Display("a", "classA", "classB");

    // tagName
    expect(display.html.tagName).to.equal('DIV');
    expect(displayP.html.tagName).to.equal('P');
    expect(displayA.html.tagName).to.equal('A');

    // className
    expect(displayP.html).to.have.class('p-1');
    expect(displayA.html).to.have.class('classA');
    expect(displayA.html).to.have.class('classB');
  });

  it('Modificação de tagName', function() 
  {
    let display = new W.Display("div", "test");
    display.addChild(new W.Display("i", "i1"));
    display.addChild(new W.Display("i", "i2"));
    display.addChild(new W.Display("i", "i3"));
    display.setData("test", "teste");
    display.setStyle("marginTop", "20px");

    display.setTagName("p");

    expect(display.html.tagName).to.equal("P");
    expect(display.children).to.have.length(3);
    expect(display.html.children).to.have.length(3);
    expect(display.getData("test")).to.equal("teste");
    expect(display.hasClass("test")).to.equal(true);
    expect(display.html.className.indexOf("test") != -1).to.equal(true);
    expect(display.html.style.marginTop).to.equal("20px");
  });

  it('Manipulação de className', function() 
  {
    let display = new W.Display("div", "class3");
    expect( display.hasClass("class3") ).to.equal(true);
    display.addClasses("class1 class2"); 
    expect( display.hasClass("class1") && display.hasClass("class2") ).to.equal(true);
    display.removeClass("class1");
    expect( display.hasClass("class1") ).to.equal(false);
    display.addClass("class1");
    expect( display.hasClass("class1") ).to.equal(true);
  });

  it('Manipulação de hierarquia', function() 
  {
    let root = new W.Display("div", "container");
    let div = new W.Display("div", "wrapper");
    let child1 = new W.Display("p", "p-1");
    let child2 = new W.Display("p", "p-2");

    root.addChild(div);
    expect(root.html).to.have.descendant('div.wrapper');
    div.addChild(child1);
    expect(div.html).to.have.descendant('p.p-1');
    root.addChild(child2);
    expect(root.html).to.have.descendants("*").and.have.length(3);
    root.removeChild(child2);
    expect(root.html).to.have.descendants("*").and.have.length(2);
    root.addChild(child2);
    expect(root.html.children).to.have.length(2);
    child1.remove();
    expect(div).to.have.length(0);
    root.append(child1);
    expect(root.html.children).to.have.length(3);
  });

  it('Manipulação de atributos', function() 
  {
    var display = new W.Display();
    display.setAttrib("title", "Titulo");
    expect( display.getAttrib("title") ).to.equal("Titulo");
    display.setData("test", "Teste");
    expect( display.getData("test") ).to.equal("Teste");
    display.setStyle("marginTop", "10px");
    expect( display.getStyle("marginTop") ).to.equal("10px");
    display.removeStyle("marginTop");
    expect( display.html.style.marginTop ).to.equal("");
  });

  it('Modificação do conteudo', function() 
  {
    var display = new W.Display();
    expect(display.content).to.have.length(0);
    display.content = "Conteudo de Texto";
    expect(display.content).to.have.length(17);
    expect(display.content).to.equal("Conteudo de Texto");
  });

  it('Busca de filhos', function() 
  {
    var root = new W.Display();
    root.setStyle("position", "absolute");
    root.setStyle("top", "0px");
    var display1 = new W.Display("div", "p1");
    display1.setStyle("width", "200px");
    display1.setStyle("height", "200px");
    var display2 = new W.Display("div", "p2");
    display2.setStyle("width", "200px");
    display2.setStyle("height", "200px");
    root.addChild(display1);
    root.addChild(display2);
    document.body.appendChild(root.html);

    // by className
    expect( root.findByClass("p1") ).to.be.a('object');
    expect( root.findByClass("p1").html ).to.have.class('p1');
    // by point
    expect( root.findByPoint(0,0) ).to.be.a('object');
    expect( root.findByPoint(0,0).html ).to.have.class('p1');
    expect( root.findByPoint(0,250) ).to.be.a('object');
    expect( root.findByPoint(0,250).html ).to.have.class('p2');
    // by area
    expect( root.findByArea( new W.Rect(0,0,200,400) ) ).to.have.length(2);

    // clear document
    root.html.remove();
  });

  it("Verificar se elemento pode ser adicionado como filho. (Pai dentro do filho)", function()
  {
    var parent = new W.Display();
    var child = new W.Display();

    expect( child.allowAddChild(parent) ).to.equal(true);
    expect( parent.allowAddChild(child) ).to.equal(true);

    parent.addChild(child);

    expect( child.allowAddChild(parent) ).to.equal(false);
    expect( parent.allowAddChild(child) ).to.equal(true);
  });

});

describe("Selectable", function ()
{
  it("Configurar estrutura básica dos filhos e validar modicações", function ()
  {

  });
});

describe("Layout", function()
{
  
  it("Configurar estrutura básica dos filhos e validar modicações", function()
  {
    let layout1 = new W.VerticalLayout("div");
    let layout2 = new W.VerticalLayout("div");
    let display = new W.Display("div", "test-1", "test-2");

    // setup layout 1
    expect( layout1.hasChildStruct() ).to.equal(false);
    layout1.setChildStruct("p", "l1");
    expect( layout1.hasChildStruct() ).to.equal(true);
    layout1.addChild(display);
    expect( layout1.html.children ).to.have.length(1);
    expect( layout1.children[0] === display ).to.equal(true);
    expect( layout1.children[0].html === display.html ).to.equal(true);
    expect( layout1.children[0].getTagName() ).to.equal("P");
    expect( display.getTagName() ).to.equal("P");
    expect( layout1.children[0].html ).to.have.class('l1');
    layout1.removeChild(display);
    expect( layout1.html.children ).to.have.length(0);
    expect( layout1.children ).to.have.length(0);
    expect( display.getTagName() ).to.equal("DIV");
    expect( display.hasClass("l1") ).to.equal(false);

    // setup layout 2
    layout2.setChildStruct("ul", "l2");
    layout2.addChild(display);
    expect( display.getTagName() ).to.equal("UL");
    expect( display.hasClass("l2") ).to.equal(true);
  });

  it("Verificar estilos requeridos", function()
  {
    let layout = new W.VerticalLayout("div");
    let display = new W.Display();

    layout.addChild(display);

    for( let key in layout.requiredStyles )
      expect( display.getStyle(key) ).to.equal( layout.requiredStyles[key] );
  });

});

describe("Widget", function()
{
  it("Adição e remoção de templates", function()
  {
    // Construtor 01
    W.Widget.AddTemplate("container-text", "<div>{{text content}}</div>");
    expect( W.Widget.HasTemplate("container-text") ).to.equal(true);
    expect( W.Widget.GetTemplate("container-text") ).to.have.property('html');
    expect( W.Widget.GetTemplate("container-text").html ).to.equal("<div>{{text content}}</div>");

    // Construtor 02
    W.Widget.AddTemplate("container-attrib", {"html":"<a href='{{attrib href}}'>clique aqui</a>"});
    expect( W.Widget.HasTemplate("container-attrib") ).to.equal(true);
    expect( W.Widget.GetTemplate("container-attrib") ).to.have.property('html');
    expect( W.Widget.GetTemplate("container-attrib").html ).to.equal("<a href='{{attrib href}}'>clique aqui</a>");

    // Remove
    W.Widget.RemoveTemplate("container-text");
    expect( W.Widget.HasTemplate("container-text") ).to.equal(false);

    W.Widget.RemoveTemplate("container-attrib");
    expect( W.Widget.HasTemplate("container-attrib") ).to.equal(false);
  });
  
  it("Criação de Widgets. (Construtor)", function()
  {
    W.Widget.AddTemplate("container-text", "<p class='test'>{{text content}}</p>");
    W.Widget.AddTemplate("complex", "<div><div><p>{{text content}}</p></div><p></p></div>");

    let widget1 = new W.Widget("container-text");
    expect( widget1.html ).to.have.class('test');
    expect( widget1.html.tagName ).to.equal('P');
    expect( widget1.children ).to.have.length(0);

    let widget2 = new W.Widget("complex");
    expect( widget2.html.tagName ).to.equal('DIV');
    expect( widget2.children ).to.have.length(2);
    expect( widget2.children[0] ).to.have.length(1);
    expect( widget2.children[0].children[0].html.tagName ).to.equal('P');
    expect( widget2.children[1] ).to.have.length(0);
  });

  it("Edição do conteudo de um container 'attrib'", function()
  {
    W.Widget.AddTemplate("test-attrib", "<div><p></p><p><img src='{{attrib img}}'/></p></div>");

    let widget = new W.Widget("test-attrib");
    let address = "https://s.ytimg.com/yts/img/avatar_48-vfllY0UTT.png";

    widget.setWidgetAttrib("img", address);
    expect(widget.getWidgetAttrib("img")).to.equal(address);
    expect(widget.children[1].children[0].getAttrib("src")).to.equal(address);
  });

  it("Edição do conteudo de um container 'text'", function()
  {
    W.Widget.AddTemplate("test-text", "<div><p></p><p>{{text content}}</p></div>");

    let widget = new W.Widget("test-text");
    let txt = "Eu sou o corpo do texto";

    widget.setText("content", txt);
    expect(widget.getText("content")).to.equal(txt);
    expect(widget.children[1].content).to.equal(txt);
  });

  it("Edição do conteudo de um container 'list'", function()
  {
    W.Widget.AddTemplate("test-list", "<div><p></p><div>{{list container}}</div></div>");

    let widget = new W.Widget("test-list");
    let widgetChild = new W.Widget(
      {"template": "text", "data":{"content":"Primeiro Texto"}}
    );

    widget.addWidget( "container", {"template": "text", "data":{"content":"Segundo Texto"}} );
    widget.insertWidget( "container", widgetChild, 0);

    expect( widget.children ).to.have.length(2);
    expect( widget.children[1] ).to.have.length(2);
    expect( widget.children[0].html.tagName ).to.equal('P');
    expect( widget.children[1].children[0].content ).to.equal("Primeiro Texto");
    expect( widget.children[1].children[1].content ).to.equal("Segundo Texto");

    widget.removeWidgetByIndex("container", 1);
    expect( widget.children[1] ).to.have.length(1);
    expect( widget.children[1].children[0].content ).to.equal("Primeiro Texto");
    widget.removeWidget("container", widgetChild);
    expect( widget.children[1] ).to.have.length(0);
  });

  it("Serialização", function()
  {
    
  });

  it("Deserialização", function()
  {
    
  });

});

describe("WEdit", function()
{
  
  it("Criar WEdit em um element dom (EMPTY)", function()
  {
    let wedit = new W.WEdit(document.body, "empty");

    expect(wedit.children).to.have.length(0);
    expect(wedit.html).to.equal(document.body);

    wedit.dispose();
  });

  it("Criar WEdit com um template basico(HEADER,MAIN,FOOTER)", function()
  {
    var wedit = new W.WEdit(document.body);

    expect(wedit.children).to.have.length(3);
    expect(wedit.html).to.have.descendant('header');
    expect(wedit.html).to.have.descendant('.main-row.expand');
    expect(wedit.html).to.have.descendant('footer');

    wedit.dispose();
  });

});



describe("Rect", function ()
{
  it('Manipular Posição', function () 
  {

  });

  it('Manipular Tamanho', function () 
  {

  });

  it('Testes de Contato', function () 
  {

  });
});



describe("SelectableGroup", function ()
{
  it('Manipular Posição', function () 
  {

  });
});

//console.log(display);
// expect(document.querySelector('#title')).to.have.html('Chai Tea')
//expect(document.querySelector('#title')).to.contain.html('<em>Tea</em>')
//expect(document.getElementById('header')).to.have.descendant("p");
//expect(document.getElementById('header')).to.have.descedant('p');





/*
var expect = chai.expect;

describe("Cow", function() {
  describe("constructor", function() {
    it("should have a default name", function() {
      var cow = new Cow();
      expect(cow.name).to.equal("Anon cow");
    });

    it("should set cow's name if provided", function() {
      var cow = new Cow("Kate");
      expect(cow.name).to.equal("Kate");
    });
  });

  describe("#greets", function() {
    it("should throw if no target is passed in", function() {
      expect(function() {
        (new Cow()).greets();
      }).to.throw(Error);
    });

    it("should greet passed target", function() {
      var greetings = (new Cow("Kate")).greets("Baby");
      expect(greetings).to.equal("Kate greets Baby");
    });
  });
});*/