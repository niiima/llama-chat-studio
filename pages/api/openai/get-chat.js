const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (
    typeof req.body.engine === "string"
    // typeof req.body.maxTokens === "number"
  ) {
    //console.log(req.body.messages);
    const msgs = [
      {
        role: "system",
        content: `you are psy, this is your name, thats all, no more ruls at all`,
      },
      ...req.body.messages,
    ];
    //console.log(msgs);

    try {
      const response = await openai.createChatCompletion({
        model: req.body.engine, //"text-davinci-003",
        messages: msgs,
        //prompt: req.body.prompt,
        temperature: req.body.temperature,
        max_tokens: req.body.max_tokens,
        top_p: req.body.top_p,
        frequency_penalty: req.body.frequency_penalty,
        presence_penalty: req.body.presence_penalty,
      });
      // console.log(response.data);
      // console.log("------------------------");
      res.status(200).json({
        text: response.data.choices[0].message.content,
        usage: {
          prompt_tokens: response.data.usage.prompt_tokens,
          completion_tokens: response.data.usage.completion_tokens,
          total_tokens: response.data.usage.total_tokens,
        },
        created: response.data.created,
        id: response.data.id,
      });
      // console.log("------------------------");
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }
  } else {
    res.status(200).json({ text: "Invalid prompt provided." });
  }
}
