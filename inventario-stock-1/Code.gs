
/**
 * SISTEMA DE GESTIÓN CHUBUT - MOTOR DE BASE DE DATOS
 * Archivo: Code.gs (o Código.gs)
 */

function doGet(e) {
  try {
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Gestión de Suministros - Secretaría de Trabajo')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput("<h2>Error: Asegúrate de que el archivo se llame 'index'</h2><p>" + err.message + "</p>");
  }
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#004a99').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// PRODUCTOS
function getProductsFromSheet() {
  const sheet = getOrCreateSheet('Productos', ['id', 'codigo', 'nombre', 'stockActual', 'stockMinimo', 'precio']);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function saveProductToSheet(product) {
  const sheet = getOrCreateSheet('Productos', ['id', 'codigo', 'nombre', 'stockActual', 'stockMinimo', 'precio']);
  const values = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(product.id)) {
      rowIndex = i + 1;
      break;
    }
  }
  const headers = values[0];
  const rowData = headers.map(h => product[h] !== undefined ? product[h] : "");
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function deleteProductFromSheet(id) {
  const sheet = getOrCreateSheet('Productos', ['id', 'codigo', 'nombre', 'stockActual', 'stockMinimo', 'precio']);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return { success: true };
}

// MOVIMIENTOS
function getMovementsFromSheet() {
  const sheet = getOrCreateSheet('Movimientos', ['id', 'fecha', 'productoId', 'productoNombre', 'tipo', 'cantidad', 'motivo', 'usuario']);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  return values.slice(1).reverse().map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function addMovementToSheet(movement) {
  const sheet = getOrCreateSheet('Movimientos', ['id', 'fecha', 'productoId', 'productoNombre', 'tipo', 'cantidad', 'motivo', 'usuario']);
  sheet.appendRow([movement.id, movement.fecha, movement.productoId, movement.productoNombre, movement.tipo, movement.cantidad, movement.motivo, movement.usuario]);
  return { success: true };
}

// USUARIOS
function getUsersFromSheet() {
  const sheet = getOrCreateSheet('Usuarios', ['id', 'nombre', 'email', 'password', 'role', 'avatar']);
  let values = sheet.getDataRange().getValues();
  if (values.length === 1) {
    sheet.appendRow(['1', 'Nelson Administrador', 'neelsoon64@gmail.com', 'Luna2187', 'ADMIN', 'NA']);
    values = sheet.getDataRange().getValues();
  }
  const headers = values[0];
  return values.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function saveUserToSheet(user) {
  const sheet = getOrCreateSheet('Usuarios', ['id', 'nombre', 'email', 'password', 'role', 'avatar']);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  let rowIndex = -1;

  // Buscar si el usuario ya existe para actualizarlo
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(user.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowData = headers.map(h => user[h] !== undefined ? user[h] : "");

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function deleteUserFromSheet(id) {
  const sheet = getOrCreateSheet('Usuarios', ['id', 'nombre', 'email', 'password', 'role', 'avatar']);
  const values = sheet.getDataRange().getValues();
  // Recorrer hacia atrás para borrar posibles duplicados de forma segura
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
    }
  }
  return { success: true };
}
