require("./core");
var types = require("../lib/types");
var def = types.Type.def;
var or = types.Type.or;
var builtin = types.builtInTypes;
var isString = builtin.string;
var isBoolean = builtin.boolean;
var defaults = require("../lib/shared").defaults;

def("XJSAttribute")
    .bases("Node")
    .build("name", "value")
    .field("name", def("XJSIdentifier"))
    .field("value", or(
        def("Literal"), // attr="value"
        def("XJSExpressionContainer"), // attr={value}
        null // attr= or just attr
    ), defaults["null"]);

def("XJSIdentifier")
    .bases("Node")
    .build("name", "namespace")
    .field("name", isString)
    .field("namespace", or(isString, null), defaults["null"]);

def("XJSNamespacedName")
    .bases("Node")
    .build("namespace", "name")
    .field("namespace", def("Identifier"))
    .field("name", def("Identifier"));

def("XJSMemberExpression")
    .bases("MemberExpression")
    .build("object", "property")
    .field("object", def("Identifier"))
    .field("property", def("Identifier"))
    .field("computed", isBoolean, defaults.false);

def("XJSSpreadAttribute")
    .bases("Node")
    .build("argument")
    .field("argument", def("Expression"));

def("XJSExpressionContainer")
    .bases("Expression")
    .build("expression")
    .field("expression", def("Expression"));

def("XJSElement")
    .bases("Expression")
    .build("openingElement", "closingElement", "children")
    .field("openingElement", def("XJSOpeningElement"))
    .field("closingElement", or(def("XJSClosingElement"), null), defaults["null"])
    .field("children", [or(
        def("XJSElement"),
        def("XJSExpressionContainer"),
        def("XJSText"),
        def("Literal") // TODO Esprima should return XJSText instead.
    )], defaults.emptyArray)
    .field("name", def("XJSIdentifier"), function() {
        // Little-known fact: the `this` object inside a default function
        // is none other than the partially-built object itself, and any
        // fields initialized directly from builder function arguments
        // (like openingElement, closingElement, and children) are
        // guaranteed to be available.
        return this.openingElement.name;
    })
    .field("selfClosing", isBoolean, function() {
        return this.openingElement.selfClosing;
    })
    .field("attributes", [def("XJSAttribute")], function() {
        return this.openingElement.attributes;
    });

def("XJSOpeningElement")
    .bases("Node") // TODO Does this make sense? Can't really be an XJSElement.
    .build("name", "attributes", "selfClosing")
    .field("name", def("XJSIdentifier"))
    .field("attributes", [def("XJSAttribute")], defaults.emptyArray)
    .field("selfClosing", isBoolean, defaults["false"]);

def("XJSClosingElement")
    .bases("Node") // TODO Same concern.
    .build("name")
    .field("name", def("XJSIdentifier"));

def("XJSText")
    .bases("Literal")
    .build("value")
    .field("value", isString);

def("XJSEmptyExpression").bases("Expression").build();

def("TypeAnnotatedIdentifier")
    .bases("Pattern")
    .build("annotation", "identifier")
    .field("annotation", def("TypeAnnotation"))
    .field("identifier", def("Identifier"));

def("TypeAnnotation")
    .bases("Pattern")
    .build("annotatedType", "templateTypes", "paramTypes", "returnType", 
           "unionType", "nullable")
    .field("annotatedType", def("Identifier"))
    .field("templateTypes", or([def("TypeAnnotation")], null))
    .field("paramTypes", or([def("TypeAnnotation")], null))
    .field("returnType", or(def("TypeAnnotation"), null))
    .field("unionType", or(def("TypeAnnotation"), null))
    .field("nullable", isBoolean);

types.finalize();
