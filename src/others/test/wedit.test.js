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

    display.setTagName("p");

    expect(display.html.tagName).to.equal("P");
    expect(display.children).to.have.length(3);
    expect(display.html.children).to.have.length(3);
    expect(display.getData("test")).to.equal("teste");
    expect(display.hasClass("test")).to.equal(true);
    expect(display.html.className.indexOf("test") != -1).to.equal(true);
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
    root.html.parentNode.removeChild(root.html);
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

  it('Is recursive parent/child', function() 
  {
    expect( false ).to.equal(true);
  });

  it("Modificação de estilos (SheetRules)", function ()
  {
    expect( false ).to.equal(true);
  });

  it("Modificação de estilos em medias diferentes (SheetRules)", function ()
  {
    expect( false ).to.equal(true);
  });

});

describe("Selectable", function ()
{
  it("Configurar estrutura básica dos filhos e validar modicações", function ()
  {
    expect( false ).to.equal(true);
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
    W.Widget.AddTemplate("container-text", "<p class='test'>{{text}}</p>");
    W.Widget.AddTemplate("complex", "<div><div><p>{{text}}</p></div><p></p></div>");

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
    W.Widget.AddTemplate("test-attrib", "<div><p></p><p><img src='{{img}}'/></p></div>");

    let widget = new W.Widget("test-attrib");
    let address = "https://s.ytimg.com/yts/img/avatar_48-vfllY0UTT.png";

    widget.setWidgetAttrib("img", address);
    expect(widget.getWidgetAttrib("img")).to.equal(address);
    expect(widget.children[1].children[0].getAttrib("src")).to.equal(address);
  });

  it("Edição do conteudo de um container 'text'", function()
  {
    W.Widget.AddTemplate("test-text", "<div><p></p><p>{{text}}</p></div>");

    let widget = new W.Widget("test-text");
    let txt = "Eu sou o corpo do texto";

    widget.setWidgetText("text", txt);
    expect(widget.getWidgetText("text")).to.equal(txt);
    expect(widget.children[1].content).to.equal(txt);
  });
  
  it("Edição do conteudo de um container 'style'", function()
  {
    W.Widget.AddTemplate("test-style", "<div><p></p><p data-style='{{style}}'>Experimento</p></div>");

    let widget = new W.Widget("test-style");

    expect( widget.getWidgetStyles("style").background ).to.equal( undefined );
    widget.setWidgetStyles("style", "background:red");
    expect( widget.getWidgetStyles("style").background ).to.equal("red");
    widget.setWidgetStyles("style", { "margin-top":"100px" });
    expect( widget.getWidgetStyles("style")["margin-top"] ).to.equal("100px");
    expect( widget.hasWidgetStyle("style", "background") ).to.equal(true);
    widget.removeWidgetStyle("style", "background");
    expect( widget.hasWidgetStyle("style", "background") ).to.equal(false);
  });

  it("Edição do conteudo de um container 'class'", function()
  {
    W.Widget.AddTemplate("test-class", "<div><p></p><p data-class='{{class}}'>Experimento</p></div>");

    let widget = new W.Widget("test-class");

    widget.addWidgetClass("class", "container");
    expect(widget.hasWidgetClass("class", "container")).to.equal(true);
    widget.removeWidgetClasses("class", "container");
    expect(widget.hasWidgetClass("class", "container")).to.equal(false);
  });

  it("Edição do conteudo de um container 'list'", function()
  {
    W.Widget.AddTemplate("test-list", "<div><p></p><div data-type='VerticalLayout'>{{list}}</div></div>");

    let widget = new W.Widget("test-list");
    let widgetChild = new W.Widget(
      {"template": "text", "data":{"text":"Primeiro Texto"}}
    );

    widget.addWidget( "list", {"template": "text", "data":{"text":"Segundo Texto"}} );
    widget.insertWidget( "list", widgetChild, 0);

    expect( widget.children ).to.have.length(2);
    expect( widget.children[1] ).to.have.length(2);
    expect( widget.children[0].html.tagName ).to.equal('P');
    expect( widget.children[1].children[0].content ).to.equal("Primeiro Texto");
    expect( widget.children[1].children[1].content ).to.equal("Segundo Texto");

    widget.removeWidgetByIndex("list", 1);
    expect( widget.children[1] ).to.have.length(1);
    expect( widget.children[1].children[0].content ).to.equal("Primeiro Texto");
    widget.removeWidget("list", widgetChild);
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

describe("SheetRules", function ()
{

  it('Adição de regras', function () 
  {

  });

  it('Remoção de regras', function () 
  {

  });

  it('Estilos em diferentes medias', function () 
  {

  });

});

describe("SelectableGroup", function ()
{
  it('Adição Singular', function () 
  {
    let selection = new W.SelectableGroup(function (selectable) { }, function (selectable) { });
    let a = new W.Selectable();
    let b = new W.Selectable();

    expect(selection.count()).to.equal(0);
    selection.add(a);
    expect(selection.count()).to.equal(1);
    expect(selection.get(0)).to.equal(a);
    selection.toggle(b, false); // nao limpar anterior
    expect(selection.count()).to.equal(2);
    expect(selection.get(1)).to.equal(b);
    selection.toggle(a, true); // limpar selecao anterior
    expect(selection.count()).to.equal(0); // a selecao anterior esta limpa e o 'a' foi toggleado
    selection.set(a, b);
    expect(selection.count()).to.equal(2);
    expect(selection.get(0)).to.equal(a);
    expect(selection.get(1)).to.equal(b);
    selection.clear();
    selection.insert(a, 99);
    expect(selection.count()).to.equal(1);
    expect(selection.get(0)).to.equal(a);
  });

  it('Remoção Singular', function () 
  {
    let selection = new W.SelectableGroup(function (selectable) { }, function (selectable) { });
    let a = new W.Selectable();
    let b = new W.Selectable();

    selection.add(a);
    expect(selection.count()).to.equal(1);
    selection.remove(a);
    expect(selection.count()).to.equal(0);
    selection.set(b, a);
    expect(selection.get(0)).to.equal(b);
    selection.remove(b);
    expect(selection.count()).to.equal(1);
    expect(selection.get(0)).to.equal(a);
  });

  it('Adição Coletiva', function () 
  {
    let selection = new W.SelectableGroup(function (selectable) { }, function (selectable) { });
    let a = new W.Selectable();
    let b = new W.Selectable();

    selection.set(b, a);
    expect(selection.count()).to.equal(2);
    selection.set(b, a, b);
    expect(selection.count()).to.equal(2);
    expect(selection.get(0)).to.equal(b);
    expect(selection.get(1)).to.equal(a);
    selection.set(a);
    expect(selection.count()).to.equal(1);
    expect(selection.get(0)).to.equal(a);
  });

  it('Remoção Coletiva', function () 
  {
    let selection = new W.SelectableGroup(function (selectable) { }, function (selectable) { });
    let a = new W.Selectable();
    let b = new W.Selectable();

    selection.set(a, b, a, b, a, b);
    expect(selection.count()).to.equal(2);
    expect(selection.get(0)).to.equal(a);
    selection.clear();
    expect(selection.count()).to.equal(0);
    selection.set(b,a,b,a,b,a,b,a);
    expect(selection.count()).to.equal(2);
    expect(selection.get(0)).to.equal(b);
    selection.set();
    expect(selection.count()).to.equal(0);
  });

  it('Filtro', function () 
  {
    let selection = new W.SelectableGroup(function (selectable) { }, function (selectable) { });
    let a = new W.Selectable("div", "a");
    let b = new W.Selectable("div", "b");

    selection.set(a,b);
    expect(selection.count()).to.equal(2);

    selection.setFilter(function (selectable){ return selectable.hasClass("a");});
    selection.set(a,b);
    expect(selection.count()).to.equal(1);
    expect(selection.get(0)).to.equal(a);

    selection.setFilter(function (selectable) { return selectable.hasClass("b"); });
    selection.set(a, b);
    expect(selection.count()).to.equal(1);
    expect(selection.get(0)).to.equal(b);

    selection.clearFilter();
    selection.set(a, b);
    expect(selection.count()).to.equal(2);
    expect(selection.get(0)).to.equal(a);
    expect(selection.get(1)).to.equal(b);
  });

  it('Combinação', function () 
  {
    let selection = new W.SelectableGroup(function (selectable) { }, function (selectable) { });
    let a = new W.Selectable("div", "a");
    let b = new W.Selectable("div", "b");

    selection.combine(true/*toggleMode*/, a, b); 
    expect(selection.count()).to.equal(2);
    expect(selection.get(0)).to.equal(a);
    expect(selection.get(1)).to.equal(b);
    selection.combine(true/*toggleMode*/, a, b);
    expect(selection.count()).to.equal(0);

    selection.combine(false/*toggleMode*/, a, b);
    expect(selection.count()).to.equal(2);
    expect(selection.get(0)).to.equal(a);
    expect(selection.get(1)).to.equal(b);
    selection.combine(false/*toggleMode*/, a, b);
    expect(selection.count()).to.equal(2);
    expect(selection.get(0)).to.equal(a);
    expect(selection.get(1)).to.equal(b);
  });

  it('Modo Cache (SHIFT)', function () 
  {
    expect(1).to.equal(2);
  });

  it('Recuperação de area', function () 
  {
    let selection = new W.SelectableGroup(function (selectable) { }, function (selectable) { });
    let a = new W.Selectable("div", "a");
    let b = new W.Selectable("div", "b");

    a.setStyle("position", "absolute");
    a.setStyle("top", "0");
    a.setStyle("width", "200px");
    a.setStyle("height", "200px");
    b.setStyle("position", "absolute");
    b.setStyle("top", "100px");
    b.setStyle("width", "200px");
    b.setStyle("height", "200px");

    document.body.appendChild(a.html);
    document.body.appendChild(b.html);

    // empty
    let area = selection.getRectArea();
    expect(area.x).to.equal(0);
    expect(area.y).to.equal(0);
    expect(area.width).to.equal(0);
    expect(area.height).to.equal(0);

    // only A
    selection.add(a);
    area = selection.getRectArea();
    expect(area.x).to.equal(0);
    expect(area.y).to.equal(0);
    expect(area.width).to.equal(200);
    expect(area.height).to.equal(200);

    // A + B
    selection.add(b);
    area = selection.getRectArea();
    expect(area.x).to.equal(0);
    expect(area.y).to.equal(0);
    expect(area.width).to.equal(200);
    expect(area.height).to.equal(300);

    // only B
    selection.set(b);
    area = selection.getRectArea();
    expect(area.x).to.equal(0);
    expect(area.y).to.equal(100);
    expect(area.width).to.equal(200);
    expect(area.height).to.equal(200);
  });
});


describe("RectView", function ()
{

  it('Pooling', function () 
  {
  });

});

describe("Ghost", function ()
{

  it('Pooling', function () 
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