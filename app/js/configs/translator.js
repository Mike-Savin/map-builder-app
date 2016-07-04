var restangular = function ($translateProvider) {
  $translateProvider.translations('en', {
    'SERVER': {
      'ERROR': {
        'PASSWORD': {
          'TOO_SHORT': 'Password should contain at least 8 characters',
          'INVALID': 'Please provide valid password'
        },
        'EMAIL': {
          'EXISTS': 'Email already exists',
          'INVALID': 'Email is invalid',
          'REQUIRED': 'Email is required',
          'NOT_FOUND': 'Email was not found'
        }
      }
    }
  });
 
  $translateProvider.preferredLanguage('en');
};