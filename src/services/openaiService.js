const { OpenAI } = require('openai');
const config = require('../config/config');

class OpenAIService {
  constructor() {
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    const openAIConfig = config.openAIConfig;

    if (openAIConfig.useAzure) {
      this.openai = new OpenAI({
        apiKey: openAIConfig.apiKey,
        baseURL: `https://${openAIConfig.azureEndpoint}/openai/deployments/${openAIConfig.azureDeployment}`,
        apiVersion: openAIConfig.azureApiVersion,
        defaultQuery: { 'api-version': openAIConfig.azureApiVersion },
        defaultHeaders: { 
          'api-key': openAIConfig.apiKey,
          'origin': 'https://ai.azure.com',
          'referer': 'https://ai.azure.com/',
          'x-ms-useragent': 'AzureOpenAI.Studio/ai.azure.com'
        },
      });
    } else {
      this.openai = new OpenAI({
        apiKey: openAIConfig.apiKey,
      });
    }
  }

  async checkGrammar(text) {
    console.log('Checking grammar for text length:', text.length);
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Check and correct the grammar in the following text. Only return the corrected text without any explanations:\n\n${text}`
        }]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Grammar check error:', error);
      throw new Error('Failed to check grammar. Please check your API configuration.');
    }
  }

  async rephraseText(text) {
    console.log('Rephrasing text length:', text.length);
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Rephrase the following text to make it more clear and concise. Only return the rephrased text without any explanations:\n\n${text}`
        }]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Rephrase error:', error);
      throw new Error('Failed to rephrase text. Please check your API configuration.');
    }
  }

  async summarizeText(text) {
    console.log('Summarizing text length:', text.length);
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Summarize the following text in a concise manner, capturing the key points. Only return the summary without any explanations:\n\n${text}`
        }]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Summarize error:', error);
      throw new Error('Failed to summarize text. Please check your API configuration.');
    }
  }

  async translateText(text, targetLanguage = 'English') {
    console.log('Translating text length:', text.length);
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Translate the following text to ${targetLanguage}. If the text is already in ${targetLanguage}, translate it to Spanish. Only return the translated text without any explanations:\n\n${text}`
        }]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Translate error:', error);
      throw new Error('Failed to translate text. Please check your API configuration.');
    }
  }
}

module.exports = new OpenAIService(); 