const markdown = (function() {

  const reHeading = /^#\s[\w-"']*/
  const reItalics = /\*[\w-"']*\*/
  const reBold = /\*{2}[\w-"']*\*{2}/
  const reCheckboxUnchecked = /^\[\s?\]/
  const reCheckboxChecked = /^\[x\]/i


  function classifyLineLevelElements(line) {
    if (reHeading.test(line)) return componentFactory.makeHeading(line)
    if (reCheckboxUnchecked.test(line)) return componentFactory.makeCheckbox(line.replace(reCheckboxUnchecked, '').trim(), false)
    if (reCheckboxChecked.test(line)) return componentFactory.makeCheckbox(line.replace(reCheckboxUnchecked, '').trim(), true)
    return componentFactory.makePara(line)
  }

  function injectInlineElements(line) {
    // console.log(line.children)
    // (function recursive(node) {
    //   if (typeof node === 'string') {

    //   }
    // })(line)
  }

  function classifyLine(text) {
    const lineElement = classifyLineLevelElements(text)
    // console.log('before > lineElement', lineElement)
    injectInlineElements(lineElement)
    // console.log('after > lineElement', lineElement)
    return lineElement

    // if (reHeading.test(text)) return componentFactory.makeHeading(text)
    // if (reCheckboxUnchecked.test(text)) return componentFactory.makeCheckbox(text.replace(reCheckboxUnchecked, '').trim(), false)
    // if (reCheckboxChecked.test(text)) return componentFactory.makeCheckbox(text.replace(reCheckboxUnchecked, '').trim(), true)
    // return componentFactory.makePara(text)

    // let rv = []
    // if (reHeading.test(text)) rv.push(...componentFactory.makeHeading(text))
    // else if (reItalics.test(text)) rv.push(...componentFactory.makeItalics(text))
    // else if (reBold.test(text)) rv.push(...componentFactory.makeBold(text))
    // else if (reCheckboxUnchecked.test(text)) rv.push(...componentFactory.makeCheckbox(text.replace(reCheckboxUnchecked, '').trim(), false))
    // else if (reCheckboxChecked.test(text)) rv.push(...componentFactory.makeCheckbox(text.replace(reCheckboxChecked, '').trim(), true))
    // else rv.push(...componentFactory.makePara(text))

    // console.log([...rv])

    // return rv
   }


  return {

    /**
     * Accepts an array of component descriptor objects and return a markdown string
     * @param {Array} md 
     */
    markdownToText: function(md) {

    },

    /**
     * Accept a string and return an array of component descriptor objects to be 
     * used as arguments to render(createElement)
     * @param {string} rawText 
     */
    textToMarkdown: function(rawText) {
      return rawText
        .split('\n')
        .reduce((acc, line) => ([ ...acc, classifyLine(line.trim())]), [])

    }
  }

})()