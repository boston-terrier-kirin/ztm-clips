module.exports = {
  content: ["./src/**/*.{html,ts}"],
  // purgeされないクラスの一覧
  safelist: ["bg-blue-400", "bg-green-400", "bg-red-400"],
  theme: {
    extend: {},
  },
  plugins: [],
};
