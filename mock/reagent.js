const Mock = require('mockjs')

const data = Mock.mock({
  'items|30': [{
    id: '@id',
    name: '@cword(3,6)',
    nameEn: '@word(6,12)',
    formula: 'H2O',
    stardard: '瓶装',
    weight: '@integer(10, 100)',
    'status|1': ['固体', '液体', '气体'],
    'level|1': ['普通', '易燃易爆', '危险']
  }]
})

module.exports = [
  {
    url: '/vue-admin-template/reagent/list',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: items.length,
          items: items
        }
      }
    }
  }
]
