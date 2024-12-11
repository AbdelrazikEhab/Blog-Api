const mogoose = require("mongoose");

const DBConfig = async () => {
  try {
    await mogoose.connect(process.env.MONGOOSE_URL);
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
DBConfig();
