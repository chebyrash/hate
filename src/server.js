const Koa = require("koa");
const Router = require("koa-router");
const Compress = require("koa-compress");
const parameter = new (require("parameter"))();

const app = new Koa();
const router = new Router();

const snowball = require("node-snowball");
const Sentiment = new require("sentiment");
const sentiment = new Sentiment();

const SCHEME = {
    text: {
        type: "string",
        required: true,
        allowEmpty: false,
        trim: true
    }
};

const ALPHABETIC_REGEX = /[^\w\s]/gi;

function isHate(text) {
    const rawTextResult = sentiment.analyze(text);
    if (rawTextResult.score < 0) {
        console.log(rawTextResult);
        return true;
    }

    const onlyAlphabetic = text.replace(ALPHABETIC_REGEX, " ");
    console.log(onlyAlphabetic);

    const splitUp = onlyAlphabetic.split(" ");
    const stems = snowball.stemword(splitUp);
    const processedText = stems.join(" ");

    const result = sentiment.analyze(processedText);
    console.log(result);
    return result.score < 0;
}

router.get("/", async ctx => {
    const errors = parameter.validate(SCHEME, ctx.query);
    if (errors) {
        console.log(errors);
        ctx.body = errors;
        return;
    }

    console.log(ctx.query.text);

    ctx.body = {
        hate: isHate(ctx.query.text)
    };
});

app
    .use(Compress())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(80, () => console.log("[SERVER] Listening"));
