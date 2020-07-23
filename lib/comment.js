const bytes = require('bytes');

const buildTable = (files) => {
  const hasLimit = files.find(file => Number.isInteger(file.maxSize));

  let table = `| File | Size | ${hasLimit ? 'Limit |' : ''} Change |\n| - | - | - |${hasLimit ? ' - |' : ''}\n`;

  files.forEach(file => {
    const filePath = file.filePath;
    const size = file.status === 'removed' ? '*removed*' : bytes(file.size);
    const maxSize = file.maxSize ? bytes(file.maxSize) : '';
    const status = file.status === 'fail' ? ' :rotating_light:' : (file.status === 'warn' ? ' :warning:' : '');
    const sign = file.size > file.baseBranchSize ? '+' : '';
    let change;

    if (file.status === 'removed') {
      change = '*removed*';
    } else if (file.baseBranchSize === 0) {
      change = '*new*';
    } else if (file.size === file.baseBranchSize) {
      change = '-';
    } else {
      change = sign + bytes(file.size - file.baseBranchSize) + ` (${sign}${Math.round((file.size - file.baseBranchSize) / file.baseBranchSize * 100 * 10) / 10}%)`;
    }

    table += `| ${filePath} | ${size}${status} | ${hasLimit ? `${maxSize} |` : ''} ${change} |\n`;
  });

  return `${table}\n`;
};

const buildComment = ({ status, fullResults, summary }) => {
  let comment = '# PR Stats (BundleWatch)\n\n';

  comment += `> ${summary}\n\n`;

  if (status === 'pass') {
    comment += '**Size limit**: pass :white_check_mark:\n\n';
  } else if (status === 'warn') {
    comment += '**Size limit**: warning :warning:\n\n';
  } else if (status === 'fail') {
    comment += '**Size limit**: failed :rotating_light:\n\n';
  } else if (status === 'removed') {
    comment += '**Size limit**: removed\n\n';
  }

  // failed files
  const failedFiles = fullResults.filter(result => result.status === 'fail' || result.status === 'warn');

  if (failedFiles.length > 0) {
    comment += buildTable(failedFiles);
  }

  // all files
  const sortedFiles = fullResults.sort((a, b) => Math.abs(b.size - b.baseBranchSize) - Math.abs(a.size - a.baseBranchSize));
  comment += '<details>\n';
  comment += '<summary>All files</summary>\n\n';
  comment += buildTable(sortedFiles);
  comment += '</details>\n';

  return comment;
};

module.exports = {
  buildComment,
};
