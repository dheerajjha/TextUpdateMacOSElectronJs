const { dialog, net } = require('electron');

class OpenAIService {
  constructor() {
    this.proxyUrl = 'https://azure-openai-proxy.ball-breaker.workers.dev/api/chat';
    this.workerKey = 'prod_9f3e8a7c1b4d6e2a5f8c0d1e3b7a9c4f';
  }

  async makeRequest(messages) {
    return new Promise((resolve, reject) => {
      try {
        const postData = JSON.stringify({ messages });

        const request = net.request({
          method: 'POST',
          url: this.proxyUrl
        });

        // Set headers
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('x-worker', this.workerKey);

        let responseData = '';

        request.on('response', (response) => {
          response.on('data', (chunk) => {
            responseData += chunk.toString();
          });

          response.on('end', () => {
            try {
              if (response.statusCode !== 200) {
                console.error('API returned status:', response.statusCode);
                console.error('Response:', responseData);
                throw new Error(`API request failed with status ${response.statusCode}`);
              }

              const data = JSON.parse(responseData);
              console.log('API response received:', data.choices ? 'Success' : 'Unknown format');

              // Handle different response formats
              if (data.choices && data.choices[0] && data.choices[0].message) {
                resolve(data.choices[0].message.content);
              } else if (data.content) {
                resolve(data.content);
              } else if (data.response) {
                resolve(data.response);
              } else {
                throw new Error('Unexpected API response format');
              }
            } catch (parseError) {
              console.error('API response parsing error:', parseError);
              this.showUpdateNotification();
              reject(new Error('Service temporarily unavailable. Please check for app updates.'));
            }
          });

          response.on('error', (error) => {
            console.error('API response error:', error);
            this.showUpdateNotification();
            reject(new Error('Service temporarily unavailable. Please check for app updates.'));
          });
        });

        request.on('error', (error) => {
          console.error('API request error:', error);
          this.showUpdateNotification();
          reject(new Error('Service temporarily unavailable. Please check for app updates.'));
        });

        request.write(postData);
        request.end();
      } catch (error) {
        console.error('Request setup error:', error);
        this.showUpdateNotification();
        reject(new Error('Service temporarily unavailable. Please check for app updates.'));
      }
    });
  }

  showUpdateNotification() {
    // Show a dialog suggesting the user update the app
    dialog.showMessageBox({
      type: 'warning',
      title: 'Grammar Ji - Service Update Required',
      message: 'The Grammar Ji service may need an update',
      detail: 'The AI service is currently unavailable. Please check for updates to the app or try again later.\n\nVisit the app store or GitHub for the latest version.',
      buttons: ['OK']
    });
  }

  async checkGrammar(text) {
    console.log('Checking grammar for text length:', text.length);
    const messages = [{
      role: "user",
      content: `Check and correct the grammar in the following text. Only return the corrected text without any explanations:\n\n${text}`
    }];
    return await this.makeRequest(messages);
  }

  async rephraseText(text) {
    console.log('Rephrasing text length:', text.length);
    const messages = [{
      role: "user",
      content: `Rephrase the following text to make it more clear and concise. Only return the rephrased text without any explanations:\n\n${text}`
    }];
    return await this.makeRequest(messages);
  }

  async summarizeText(text) {
    console.log('Summarizing text length:', text.length);
    const messages = [{
      role: "user",
      content: `Summarize the following text in a concise manner, capturing the key points. Only return the summary without any explanations:\n\n${text}`
    }];
    return await this.makeRequest(messages);
  }

  async translateText(text, targetLanguage = 'English') {
    console.log('Translating text length:', text.length);
    const messages = [{
      role: "user",
      content: `Translate the following text to ${targetLanguage}. If the text is already in ${targetLanguage}, translate it to Spanish. Only return the translated text without any explanations:\n\n${text}`
    }];
    return await this.makeRequest(messages);
  }
}

module.exports = new OpenAIService(); 