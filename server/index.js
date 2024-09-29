//  Babel is used to compile React syntaxes like JSX
//    during the SSR shell rendering
require("@babel/register")({
  ignore: [/(node_modules)/],
  presets: ["@babel/preset-env", "@babel/preset-react"],
});

require("./server")