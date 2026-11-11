// next-env.d.ts declares this too, but it is generated and gitignored,
// and CI typechecks before the first build creates it.
declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
