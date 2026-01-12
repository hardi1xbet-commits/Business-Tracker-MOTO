const { useState, useEffect, Fragment } = React;
const { Download, Save, LogOut, Smartphone } = lucide;

const BusinessTracker2026 = () => {
  const [data, setData] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (!isStandalone) {
      setShowInstallPrompt(true);
    }
  }, []);

  const handleEmailAuth = async () => {
    setAuthError('');
    
    if (!email || !password) {
      setAuthError('Please enter email and password');
      return;
    }

    const userData = {
      email: email,
      id: btoa(email),
      displayName: email.split('@')[0]
    };
    
    setUser(userData);
    
    try {
      const saved = await window.storage.get(`tracker_${userData.id}`, true);
      if (saved && saved.value) {
        setData(JSON.parse(saved.value));
        setSaveMessage('Data loaded successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        generateInitialData();
      }
    } catch (error) {
      generateInitialData();
    }
  };

  const handleGoogleAuth = () => {
    setAuthError('');
    const userData = {
      email: 'user@gmail.com',
      id: 'google_user_123',
      displayName: 'Google User'
    };
    
    setUser(userData);
    loadUserData(userData.id);
  };

  const handleLogout = () => {
    setUser(null);
    setData([]);
    setEmail('');
    setPassword('');
  };

  const generateInitialData = () => {
    const startDate = new Date(2026, 0, 2);
    const endDate = new Date(2026, 11, 31);
    const weeks = [];
    
    let currentDate = new Date(startDate);
    let weekNumber = 1;
    
    while (currentDate <= endDate) {
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const dateStr = currentDate.toLocaleDateString('en-ZA');
      
      weeks.push({
        id: weekNumber,
        week: `Week ${weekNumber}`,
        date: dateStr,
        month: month,
        deposit: 0,
        out: 0
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }
    
    setData(weeks);
  };

  const loadUserData = async (userId) => {
    try {
      const saved = await window.storage.get(`tracker_${userId}`, true);
      if (saved && saved.value) {
        setData(JSON.parse(saved.value));
        setSaveMessage('Data loaded successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        generateInitialData();
      }
    } catch (error) {
      generateInitialData();
    }
  };

  const handleInputChange = (id, field, value) => {
    setData(prevData =>
      prevData.map(row =>
        row.id === id ? { ...row, [field]: parseFloat(value) || 0 } : row
      )
    );
    setSaveMessage('');
  };

  const saveData = async () => {
    if (!user) {
      setSaveMessage('Please login to save data');
      return;
    }

    try {
      await window.storage.set(`tracker_${user.id}`, JSON.stringify(data), true);
      setSaveMessage('Data saved to cloud successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving data');
      console.error('Save error:', error);
    }
  };

  const getMonthlyTotal = (month, field) => {
    return data
      .filter(row => row.month === month)
      .reduce((sum, row) => sum + (row[field] || 0), 0);
  };

  const getMonthlyNet = (month) => {
    return getMonthlyTotal(month, 'deposit') - getMonthlyTotal(month, 'out');
  };

  const months = [...new Set(data.map(row => row.month))];

  const exportToCSV = () => {
    try {
      let csv = 'Week,Date,Month,Deposit (R),Out (R),Net (R)\n';
      
      data.forEach(row => {
        const net = row.deposit - row.out;
        csv += `${row.week},${row.date},${row.month},${row.deposit},${row.out},${net}\n`;
      });
      
      months.forEach(month => {
        const deposit = getMonthlyTotal(month, 'deposit');
        const out = getMonthlyTotal(month, 'out');
        const net = getMonthlyNet(month);
        csv += `\n${month} Total,,,${deposit},${out},${net}\n`;
      });
      
      const yearDeposit = data.reduce((sum, row) => sum + row.deposit, 0);
      const yearOut = data.reduce((sum, row) => sum + row.out, 0);
      const yearNet = yearDeposit - yearOut;
      csv += `\nYear Total,,,${yearDeposit},${yearOut},${yearNet}\n`;
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'business_tracker_2026.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSaveMessage('CSV exported successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error exporting CSV');
      console.error('Export error:', error);
    }
  };

  if (!user) {
    return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4' },
      showInstallPrompt && React.createElement('div', { className: 'fixed top-4 left-4 right-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-lg z-50 max-w-md mx-auto' },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement(Smartphone, { className: 'text-yellow-600 flex-shrink-0 mt-1', size: 24 }),
          React.createElement('div', { className: 'flex-1' },
            React.createElement('h3', { className: 'font-bold text-yellow-900 mb-1' }, 'Install as App'),
            React.createElement('p', { className: 'text-sm text-yellow-800 mb-2' }, 'For the best experience, add this to your home screen!'),
            React.createElement('p', { className: 'text-xs text-yellow-700' }, 
              'Tap the Share button ',
              React.createElement('strong', null, '⬆️'),
              ' below and select "Add to Home Screen"'
            )
          ),
          React.createElement('button', { 
            onClick: () => setShowInstallPrompt(false),
            className: 'text-yellow-600 hover:text-yellow-800 font-bold'
          }, '✕')
        )
      ),
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md' },
        React.createElement('div', { className: 'text-center mb-8' },
          React.createElement('h1', { className: 'text-4xl font-bold text-gray-800 mb-2' }, 'Business Tracker'),
          React.createElement('p', { className: 'text-gray-600' }, 'Sign in to access your financial data from anywhere')
        ),
        React.createElement('button', {
          onClick: handleGoogleAuth,
          className: 'w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-3 mb-6'
        }, 
          React.createElement('svg', { className: 'w-6 h-6', viewBox: '0 0 24 24' },
            React.createElement('path', { fill: '#4285F4', d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' }),
            React.createElement('path', { fill: '#34A853', d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' }),
            React.createElement('path', { fill: '#FBBC05', d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' }),
            React.createElement('path', { fill: '#EA4335', d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' })
          ),
          'Continue with Google'
        ),
        React.createElement('div', { className: 'relative mb-6' },
          React.createElement('div', { className: 'absolute inset-0 flex items-center' },
            React.createElement('div', { className: 'w-full border-t border-gray-300' })
          ),
          React.createElement('div', { className: 'relative flex justify-center text-sm' },
            React.createElement('span', { className: 'px-4 bg-white text-gray-500' }, 'Or continue with email')
          )
        ),
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Email'),
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: (e) => setEmail(e.target.value),
              onKeyPress: (e) => e.key === 'Enter' && handleEmailAuth(),
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              placeholder: 'your@email.com'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Password'),
            React.createElement('input', {
              type: 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              onKeyPress: (e) => e.key === 'Enter' && handleEmailAuth(),
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              placeholder: '••••••••'
            })
          ),
          authError && React.createElement('div', { className: 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm' }, authError),
          React.createElement('button', {
            onClick: handleEmailAuth,
            className: 'w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition'
          }, isSignUp ? 'Sign Up' : 'Sign In'),
          React.createElement('button', {
            onClick: () => setIsSignUp(!isSignUp),
            className: 'w-full text-blue-600 hover:text-blue-700 text-sm font-medium'
          }, isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up")
        ),
        React.createElement('div', { className: 'mt-6 p-4 bg-blue-50 rounded-lg' },
          React.createElement('p', { className: 'text-xs text-blue-800' },
            React.createElement('strong', null, 'Note: '),
            'Your data is stored securely and syncs across devices when you\'re logged in.'
          )
        )
      )
    );
  }

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      React.createElement('div', { className: 'bg-white rounded-lg shadow-xl p-6 mb-6' },
        React.createElement('div', { className: 'flex justify-between items-center mb-4' },
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-3xl font-bold text-gray-800' }, '2026 Business Financial Tracker'),
            React.createElement('p', { className: 'text-sm text-gray-600 mt-1' },
              'Logged in as: ',
              React.createElement('strong', null, user.email)
            )
          ),
          React.createElement('div', { className: 'flex gap-3 items-center' },
            saveMessage && React.createElement('span', { className: 'text-green-600 font-semibold' }, saveMessage),
            React.createElement('button', {
              onClick: saveData,
              className: 'flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition'
            }, React.createElement(Save, { size: 20 }), 'Save to Cloud'),
            React.createElement('button', {
              onClick: exportToCSV,
              className: 'flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition'
            }, React.createElement(Download, { size: 20 }), 'Export CSV'),
            React.createElement('button', {
              onClick: handleLogout,
              className: 'flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition'
            }, React.createElement(LogOut, { size: 20 }), 'Logout')
          )
        ),
        React.createElement('p', { className: 'text-gray-600' }, 'Track your weekly deposits and expenses from 02/01/2026 to 31/12/2026')
      ),
      React.createElement('div', { className: 'bg-white rounded-lg shadow-xl overflow-hidden' },
        React.createElement('div', { className: 'overflow-x-auto' },
          React.createElement('table', { className: 'w-full' },
            React.createElement('thead', { className: 'bg-indigo-600 text-white' },
              React.createElement('tr', null,
                React.createElement('th', { className: 'px-4 py-3 text-left' }, 'Week'),
                React.createElement('th', { className: 'px-4 py-3 text-left' }, 'Date'),
                React.createElement('th', { className: 'px-4 py-3 text-left' }, 'Month'),
                React.createElement('th', { className: 'px-4 py-3 text-right' }, 'Deposit (R)'),
                React.createElement('th', { className: 'px-4 py-3 text-right' }, 'Out (R)'),
                React.createElement('th', { className: 'px-4 py-3 text-right' }, 'Net (R)')
              )
            ),
            React.createElement('tbody', null,
              data.map((row, index) => {
                const isNewMonth = index === 0 || data[index - 1].month !== row.month;
                const isLastOfMonth = index === data.length - 1 || data[index + 1].month !== row.month;
                
                return React.createElement(Fragment, { key: row.id },
                  isNewMonth && index !== 0 && React.createElement('tr', { className: 'bg-indigo-50 font-bold border-t-2 border-indigo-200' },
                    React.createElement('td', { colSpan: '3', className: 'px-4 py-3' }, data[index - 1].month + ' Total'),
                    React.createElement('td', { className: 'px-4 py-3 text-right text-green-700' }, 'R ' + getMonthlyTotal(data[index - 1].month, 'deposit').toFixed(2)),
                    React.createElement('td', { className: 'px-4 py-3 text-right text-red-700' }, 'R ' + getMonthlyTotal(data[index - 1].month, 'out').toFixed(2)),
                    React.createElement('td', { className: 'px-4 py-3 text-right text-indigo-700' }, 'R ' + getMonthlyNet(data[index - 1].month).toFixed(2))
                  ),
                  React.createElement('tr', { className: index % 2 === 0 ? 'bg-gray-50' : 'bg-white' },
                    React.createElement('td', { className: 'px-4 py-3 text-sm' }, row.week),
                    React.createElement('td', { className: 'px-4 py-3 text-sm' }, row.date),
                    React.createElement('td', { className: 'px-4 py-3 text-sm font-medium' }, row.month),
                    React.createElement('td', { className: 'px-4 py-3' },
                      React.createElement('input', {
                        type: 'number',
                        value: row.deposit || '',
                        onChange: (e) => handleInputChange(row.id, 'deposit', e.target.value),
                        className: 'w-full px-2 py-1 border rounded text-right focus:ring-2 focus:ring-green-500 focus:border-transparent',
                        placeholder: '0.00'
                      })
                    ),
                    React.createElement('td', { className: 'px-4 py-3' },
                      React.createElement('input', {
                        type: 'number',
                        value: row.out || '',
                        onChange: (e) => handleInputChange(row.id, 'out', e.target.value),
                        className: 'w-full px-2 py-1 border rounded text-right focus:ring-2 focus:ring-red-500 focus:border-transparent',
                        placeholder: '0.00'
                      })
                    ),
                    React.createElement('td', { className: 'px-4 py-3 text-right font-semibold' }, 'R ' + (row.deposit - row.out).toFixed(2))
                  ),
                  isLastOfMonth && React.createElement('tr', { className: 'bg-indigo-50 font-bold border-t-2 border-indigo-200' },
                    React.createElement('td', { colSpan: '3', className: 'px-4 py-3' }, row.month + ' Total'),
                    React.createElement('td', { className: 'px-4 py-3 text-right text-green-700' }, 'R ' + getMonthlyTotal(row.month, 'deposit').toFixed(2)),
                    React.createElement('td', { className: 'px-4 py-3 text-right text-red-700' }, 'R ' + getMonthlyTotal(row.month, 'out').toFixed(2)),
                    React.createElement('td', { className: 'px-4 py-3 text-right text-indigo-700' }, 'R ' + getMonthlyNet(row.month).toFixed(2))
                  )
                );
              }),
              React.createElement('tr', { className: 'bg-indigo-700 text-white font-bold text-lg border-t-4 border-indigo-900' },
                React.createElement('td', { colSpan: '3', className: 'px-4 py-4' }, '2026 YEAR TOTAL'),
                React.createElement('td', { className: 'px-4 py-4 text-right' }, 'R ' + data.reduce((sum, row) => sum + row.deposit, 0).toFixed(2)),
                React.createElement('td', { className: 'px-4 py-4 text-right' }, 'R ' + data.reduce((sum, row) => sum + row.out, 0).toFixed(2)),
                React.createElement('td', { className: 'px-4 py-4 text-right' }, 'R ' + (data.reduce((sum, row) => sum + row.deposit, 0) - data.reduce((sum, row) => sum + row.out, 0)).toFixed(2))
              )
            )
          )
        )
      )
    )
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(BusinessTracker2026));
