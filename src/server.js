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

const BLACKLIST = [
    "boner",
    "moms",
    "socials",
    "turned",
    "deep",
    "penises",
    "thread",
    "porn",
    "rekt",
    "swallow",
    "paedophile",
    "bbc",
    "gangbang",
    "succ",
    "cuck",
    "cuckold",
    "sissy",
    "deepfake",
    "masturbation",
    "fucking",
    "chubby",
    "gay",
    "masturbate",
    "cum",
    "shit",
    "milf",
    "loli",
    "erections",
    "erection",
    "tribute",
    "tributes",
    "dick",
    "pussy",
    "incest",
    "trap",
    "celebrities",
    "celeb",
    "fap",
    "fappening",
    "blacked",
    "niggers",
    "nazi",
    "hitler",
    "deepnude",
    "deepnudes",
    "wife",
    "slut",
    "creep",
    "furry",
    "furries",
    "butt"
];

const OPTIONS = {
    extras: BLACKLIST.map(word => {
            return {[word]: -20}
        }
    ).reduce(
        (acc, curr) => {
            const key = Object.keys(curr)[0];
            acc[key] = curr[key];
            return acc;
        }, {})
};

const ALPHABETIC_REGEX = /[^\w\s]/gi;

function isHate(text) {
    const rawTextResult = sentiment.analyze(text, OPTIONS);
    if (rawTextResult.score < 0) {
        console.log(rawTextResult);
        return true;
    }

    const onlyAlphabetic = text.replace(ALPHABETIC_REGEX, " ");
    console.log(onlyAlphabetic);

    const splitUp = onlyAlphabetic.split(" ");
    const stems = snowball.stemword(splitUp);
    const processedText = stems.join(" ");

    const result = sentiment.analyze(processedText, OPTIONS);
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