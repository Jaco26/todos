const markdown = (function markdown() {



  return {
    /**
     * Accept a string and return an array of objects to be used as arguments
     * to render(createElement)
     * @param {string} rawText 
     */
    process: function(rawText) {
      const rv = []
      const lines = rawText.split('\n')
      console.log(lines)

      return rv
    }
  }

})()