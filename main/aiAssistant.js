require('dotenv').config();

const OpenAI = require('openai');

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1"
})

async function generateSummary(title, content, isSelection) {
  try {
    const response = await deepseekClient.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {"role": "system", "content": "You are a helpful assistant that summarizes web page content."},
        {"role": "user", "content": isSelection 
          ? `Summarize the following selected text from a web page. Title: ${title}\n\nSelected Content: ${content}`
          : `Summarize the following web page content. Title: ${title}\n\nContent: ${content}`}
      ],
      max_tokens: 1024,
      temperature: 0.7
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error generating summary with DeepSeek:', error)
    throw error
  }
}

ipc.on('generate-summary', async (event, { url, title, content, isSelection }) => {
  try {
    console.log("Generating summary for", title, content)
    const summary = await generateSummary(title, content, isSelection)
    event.reply('summary-generated', summary)
  } catch (error) {
    console.error('Error generating summary:', error)
    event.reply('summary-generated', 'Unable to generate summary. Please try again.')
  }
})