# vue 

## 1. ElementUI table的行高设置

- 修改el-table元素中row-style属性里的height, :row-style="{height: '80px'}"、 :cell-style="{padding: '0'}"

```javascript
<el-table
    :data="tableData"
    style="width: 100%"
    :row-style="{height: '80px'}"
    :cell-style="{padding: '0'}"
    >
```
