
CONFIG_COLUMN_LOAD
:
{ 操作: true, 证载用途: true, 所在院落地址: true, 建筑面积: true, ID: true, 楼宇名称: true, 所在院落名称: true, 楼宇地址: true }
CONFIG_COLUMN_SOURCE
:
{ }
CONFIG_COMPARE_SOURCE
:
null
CONFIG_RAW
:
"{\"supportAjaxPage\":true,\"asyncTotals\":true,\"deleteEnable\":true,\"exportEnable\":true,\"supportAutoOrder\":true,\"useWordBreak\":true,\"height\":\"100% - 65px\",\"pageSize\":20,\"isChecked\":\"multiple\",\"database\":\" \",\"templateFileType\":\"aspose\",\"powerSearch\":\"\",\"supportCheckbox\":true,\"checkboxConfig\":{\"useRowCheck\":false,\"useRadio\":false,\"fixed\":\"left\"},\"summaryHandler\":\"function(allRowData) {\\n  //allRowData：当前页面所有行数据，类型为json数组\\n  //以下为求和示例\\n  let sum = 0;\\n  allRowData.forEach(itemRow => {\\n    sum += Number(itemRow.建筑面积) * 1000000;\\n  });\\n  sum = sum /1000000;\\n  // 返回与列名匹配的json对象\\n  // 注意: 列中存在返回对象中的字段名称时，以下汇总数据才会生效\\n  return {\\n   楼宇地址 : '<span style=\\\"color:red\\\">合计</span>',\\n    建筑面积: sum\\n  };\\n}\",\"columnData\":[{\"columnID\":\"137309b48809435ba9e3f8c997da397c\",\"key\":\"ID\",\"text\":\"ID\",\"width\":\"200px\",\"align\":\"center\",\"isShow\":false,\"remind\":\"\",\"isLoad\":\"true\",\"gm_order\":1,\"gm_checkbox\":false,\"gm_checkbox_disabled\":false,\"gm-cache-key\":\"0\",\"gm-level-key\":0,\"sorting\":\"undefined\",\"fixed\":\"undefined\",\"isLoadCustomText\":\"\",\"templateType\":\"1\",\"baseTemplate\":\"\",\"advancedTemplate\":\"\",\"filterType\":\"1\",\"name\":\"\",\"type\":\"1\",\"editType\":{\"name\":\"\",\"type\":\"1\",\"content\":{}},\"title\":\"\",\"value\":\"\",\"showField\":\"\",\"valueField\":\"\",\"isFilter\":false,\"enable\":\"false\",\"filterValue\":[],\"filterRowData\":[],\"editorRowData\":[]},{\"columnID\":\"f131f6102ac24a769b29a14df0f3f968\",\"key\":\"楼宇地址\",\"text\":\"楼宇地址\",\"width\":\"400px\",\"align\":\"center\",\"isShow\":true,\"remind\":\"\",\"isLoad\":\"true\",\"gm_order\":2,\"gm_checkbox\":false,\"gm_checkbox_disabled\":false,\"gm-cache-key\":\"1\",\"gm-level-key\":0,\"sorting\":\"\",\"fixed\":\"undefined\",\"isLoadCustomText\":\"\",\"templateType\":\"1\",\"baseTemplate\":\"<a href=\\\"\\\" onclick=\\\"viewBuildData('[*ID*]','[*楼宇地址*]-楼宇');return false;\\\">[*楼宇地址*]</a>\",\"advancedTemplate\":\"\",\"filterType\":\"1\",\"name\":\"\",\"type\":\"1\",\"editType\":{\"name\":\"\",\"type\":\"1\",\"content\":{}},\"title\":\"\",\"value\":\"\",\"showField\":\"\",\"valueField\":\"\",\"isFilter\":false,\"enable\":\"false\",\"filterValue\":[],\"filterRowData\":[],\"editorRowData\":[]},{\"columnID\":\"694baf1fa730466fab6b2b91d4ad6c1f\",\"key\":\"楼宇名称\",\"text\":\"楼宇名称\",\"width\":\"300px\",\"align\":\"center\",\"isShow\":true,\"remind\":\"\",\"isLoad\":\"true\",\"gm_order\":3,\"gm_checkbox\":false,\"gm_checkbox_disabled\":false,\"gm-cache-key\":\"2\",\"gm-level-key\":0,\"sorting\":\"\",\"fixed\":\"undefined\",\"isLoadCustomText\":\"\",\"templateType\":\"1\",\"baseTemplate\":\"\",\"advancedTemplate\":\"\",\"filterType\":\"1\",\"name\":\"\",\"type\":\"1\",\"editType\":{\"name\":\"\",\"type\":\"1\",\"content\":{}},\"title\":\"\",\"value\":\"\",\"showField\":\"\",\"valueField\":\"\",\"isFilter\":false,\"enable\":\"false\",\"filterValue\":[],\"filterRowData\":[],\"editorRowData\":[]},{\"columnID\":\"09a4e5f4827048a694c9bbcb0f100a48\",\"key\":\"建筑面积\",\"text\":\"建筑面积\",\"width\":\"300px\",\"align\":\"center\",\"isShow\":true,\"remind\":\"\",\"isLoad\":\"true\",\"gm_order\":4,\"gm_checkbox\":false,\"gm_checkbox_disabled\":false,\"gm-cache-key\":\"3\",\"gm-level-key\":0,\"sorting\":\"\",\"fixed\":\"undefined\",\"isLoadCustomText\":\"\",\"templateType\":\"1\",\"baseTemplate\":\"\",\"advancedTemplate\":\"\",\"filterType\":\"1\",\"name\":\"\",\"type\":\"1\",\"editType\":{\"name\":\"\",\"type\":\"1\",\"content\":{}},\"title\":\"\",\"value\":\"\",\"showField\":\"\",\"valueField\":\"\",\"isFilter\":false,\"enable\":\"false\",\"filterValue\":[],\"filterRowData\":[],\"editorRowData\":[]},{\"columnID\":\"c83dd61fb0934ca19728ae9e99922de5\",\"key\":\"证载用途\",\"text\":\"证载用途\",\"width\":\"200px\",\"align\":\"center\",\"isShow\":true,\"remind\":\"\",\"isLoad\":\"true\",\"gm_order\":5,\"gm_checkbox\":false,\"gm_checkbox_disabled\":false,\"gm-cache-key\":\"4\",\"gm-level-key\":0,\"sorting\":\"\"},{\"key\":\"所在院落地址\",\"text\":\"所在院落地址\",\"align\":\"center\",\"isShow\":false,\"width\":\"300px\",\"sorting\":\"\",\"remind\":\"\",\"fixed\":\"right\",\"isLoad\":\"true\",\"isLoadCustomText\":\"\",\"templateType\":\"1\",\"baseTemplate\":\"\",\"advancedTemplate\":\"\",\"filterType\":\"1\",\"name\":\"\",\"type\":\"1\",\"editType\":{\"name\":\"\",\"type\":\"1\",\"content\":{}},\"title\":\"\",\"value\":\"\",\"showField\":\"\",\"valueField\":\"\",\"columnID\":\"cd8436a8e33a4c9fb815f0d4642417a5\",\"isFilter\":false,\"enable\":\"false\",\"filterValue\":[],\"filterRowData\":[],\"editorRowData\":[],\"gm_order\":6,\"gm_checkbox\":false,\"gm_checkbox_disabled\":false,\"gm-cache-key\":\"5\",\"gm-level-key\":0},{\"key\":\"所在院落名称\",\"text\":\"所在院落名称\",\"align\":\"center\",\"isShow\":true,\"width\":\"200px\",\"sorting\":\"\",\"remind\":\"\",\"fixed\":\"right\",\"isLoad\":\"true\",\"isLoadCustomText\":\"\",\"templateType\":\"1\",\"baseTemplate\":\"\",\"advancedTemplate\":\"\",\"filterType\":\"1\",\"name\":\"\",\"type\":\"1\",\"editType\":{\"name\":\"\",\"type\":\"1\",\"content\":{}},\"title\":\"\",\"value\":\"\",\"showField\":\"\",\"valueField\":\"\",\"columnID\":\"c8b80b56e7a049408558fba8b0358d35\",\"isFilter\":false,\"enable\":\"false\",\"filterValue\":[],\"filterRowData\":[],\"editorRowData\":[],\"gm_order\":7,\"gm_checkbox\":false,\"gm_checkbox_disabled\":false,\"gm-cache-key\":\"6\",\"gm-level-key\":0},{\"key\":\"操作\",\"text\":\"操作\",\"align\":\"center\",\"isShow\":true,\"width\":\"200px\",\"sorting\":\"undefined\",\"remind\":\"\",\"fixed\":\"right\",\"isLoad\":\"true\",\"isLoadCustomText\":\"\",\"templateType\":\"1\",\"baseTemplate\":\"<a class=\\\"active-btn\\\" onclick=\\\"showMapOfMapping('[*LONGITUDE*]', '[*LATITUDE*]')\\\"><img src=\\\"../../../web/Images/oldsysimg/map.png\\\" /></a><a class=\\\"active-btn\\\"  onclick=\\\"viewBuildDataEx('[*ID*]');return false;\\\"><img src=\\\"../../../web/Images/oldsysimg/xiugai2.png\\\" /></a>\",\"advancedTemplate\":\"\",\"filterType\":\"1\",\"name\":\"\",\"type\":\"1\",\"editType\":{\"name\":\"\",\"type\":\"1\",\"content\":{}},\"title\":\"\",\"value\":\"\",\"showField\":\"\",\"valueField\":\"\",\"columnID\":\"16d39f89102a4bf1a69d3bcee9eb9ee2\",\"isFilter\":false,\"enable\":\"false\",\"filterValue\":[],\"filterRowData\":[],\"editorRowData\":[],\"gm_order\":8,\"gm_checkbox\":false,\"gm_checkbox_disabled\":false,\"gm-cache-key\":\"7\",\"gm-level-key\":0}]}"
CONFIG_SEARCH
:
"{\"type\":\"2\",\"item\":[{\"title\":\"楼宇名称\",\"field\":\"楼宇名称\",\"dataType\":\"string\",\"compareType\":\"7\",\"required\":false,\"connectType\":\"1\",\"type\":\"1\",\"filterValue\":[],\"filterRowData\":[],\"sourceName\":null,\"showField\":\"\",\"valueField\":\"\",\"name\":\"\",\"isDynamicParam\":false,\"isAdvancedSearch\":false,\"isHide\":true,\"search_select\":false},{\"title\":\"楼宇地址\",\"field\":\"楼宇地址\",\"dataType\":\"string\",\"compareType\":\"7\",\"required\":false,\"connectType\":\"1\",\"type\":\"1\",\"filterValue\":[],\"filterRowData\":[],\"sourceName\":null,\"showField\":\"\",\"valueField\":\"\",\"name\":\"\",\"isDynamicParam\":false,\"isAdvancedSearch\":false,\"isHide\":true,\"search_select\":false}],\"style\":\"1\"}"
NAME
:
"BGYF_BUILDING_LIST_TZ"