// Debug script to test SSH data parsing
const testData = `# SSH Sessions (Boss view)

**Timezone:** Europe/Istanbul (UTC+03:00)
**Report Period:** Last 14 days (15 files processed)
**Generated:** 11-09-2025 00:10:14

| IP            | User    | Method    | Start               | End                 | Duration   |
| :------------ | :------ | :-------- | :------------------ | :------------------ | ---------: |
| 31.223.50.217 | hpcuser | password  | 29-08-2025 15:11:49 | 29-08-2025 17:27:11 | 2h 15m 22s |
| 135.19.36.235 | hpcuser | password  | 28-08-2025 13:54:28 | 28-08-2025 15:29:07 | 1h 34m 39s |
| 135.19.36.235 | hpcuser | password  | 27-08-2025 19:39:12 | 28-08-2025 04:01:29 | 8h 22m 17s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 16:57:50 | 10-09-2025 16:58:06 |        16s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 14:59:06 | 10-09-2025 14:59:16 |        10s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 14:58:05 | 10-09-2025 14:58:49 |        44s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 14:57:11 | 10-09-2025 14:58:02 |        51s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 14:41:15 | 10-09-2025 14:56:49 |    15m 34s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 14:46:49 | 10-09-2025 14:46:52 |         3s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 11:52:46 | 10-09-2025 14:41:04 | 2h 48m 18s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 11:50:36 | 10-09-2025 11:51:03 |        27s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 11:25:18 | 10-09-2025 11:28:26 |      3m 8s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 09:58:49 | 10-09-2025 11:21:57 |  1h 23m 8s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 11:16:23 | 10-09-2025 11:16:27 |         4s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 09:48:08 | 10-09-2025 09:56:08 |      8m 0s |
| 46.1.105.147  | hpcuser | publickey | 10-09-2025 09:47:26 | 10-09-2025 09:48:03 |        37s |
| 46.1.105.147  | hpcuser | publickey | 09-09-2025 16:32:57 | 09-09-2025 18:38:02 |   2h 5m 5s |`;

function parseSSHData(markdownData) {
  const lines = markdownData.split('\n');
  const sessions = [];
  
  console.log('Total lines:', lines.length);
  console.log('First 10 lines:');
  lines.slice(0, 10).forEach((line, i) => {
    console.log(`${i}: "${line}"`);
  });
  
  // Find the table start (skip header and separator)
  let dataStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    console.log(`Line ${i}: "${lines[i]}" - contains separator? ${lines[i].includes('|') && lines[i].includes(':') && lines[i].includes('-')}`);
    // Look for markdown table separator line (contains dashes and colons)
    if (lines[i].includes('|') && lines[i].includes(':') && lines[i].includes('-')) {
      dataStartIndex = i + 1;
      console.log('Found separator at line', i, 'data starts at', dataStartIndex);
      break;
    }
  }
  
  if (dataStartIndex === -1) {
    console.log('No table separator found!');
    return sessions;
  }
  
  console.log('Processing data lines from index', dataStartIndex);
  
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`Data line ${i}: "${line}"`);
    
    if (!line || !line.startsWith('|')) {
      console.log('Skipping line - empty or no pipe start');
      continue;
    }
    
    const parts = line.split('|').map(part => part.trim()).filter(part => part);
    console.log('Parts:', parts, 'length:', parts.length);
    
    if (parts.length < 6) {
      console.log('Skipping line - not enough parts');
      continue;
    }
    
    const [ip, user, method, start, end, duration] = parts;
    
    console.log('Creating session:', { ip, user, method, start, end, duration });
    
    sessions.push({
      ip,
      user,
      method,
      startTime: start,
      endTime: end,
      duration
    });
  }
  
  console.log('Total sessions parsed:', sessions.length);
  return sessions;
}

const result = parseSSHData(testData);
console.log('\nFinal result:', result);
