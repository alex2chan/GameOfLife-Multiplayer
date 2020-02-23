const assert = require('chai').assert
const color = require('../color.js')

describe('Color', function(){
  describe('Getting a random color', function() {
    it('first color generated should not be the same as the second color generated', function() {
      assert.notDeepEqual(color.getRandomColor(), color.getRandomColor())
    })

    it('color should be of hex format', function() {
      assert.match(color.getRandomColor(), /^#[0-9A-F]{6}$/i)
    })
  })

  var colors = [
    {r: 255, g: 0, b: 150, hex: '#ff0096'},
    {r: 255, g: 105, b: 180, hex: '#ff69b4'},
    {r: 255, g: 255, b: 255, hex: '#ffffff'},
    {r: 0, g: 0, b: 0, hex: '#000000'}
  ]

  describe('Converting hex to rgb', function() {
    for (c of colors) {
      var rgb = color.hexToRGB(c.hex)

      it(c.hex + ' should return the correct rgb representation, ' + 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')', function() {
        assert.ownInclude(rgb, {r: c.r, g: c.g, b: c.b})
      })

      it('each of r, g and b should be of type Number', function() {
        assert.typeOf(rgb.r, 'number')
        assert.typeOf(rgb.g, 'number')
        assert.typeOf(rgb.b, 'number')
      })
    }
  })

  describe('Converting rgb to hex', function() {
    for (c of colors) {
      var hex = color.rgbToHex(c.r, c.g, c.b)

      it('rgb(' + c.r + ', ' + c.g + ', ' + c.b + ') should return the correct hex representation, ' + c.hex, function() {
        assert.strictEqual(hex, c.hex)
      })

      it('color should be of hex format', function() {
        assert.match(hex, /^#[0-9A-F]{6}$/i)
      })
    }
  })
})
