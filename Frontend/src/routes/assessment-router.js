const apiPath = 'http://192.168.0.107:8080';

export default {
  checkNumberPath: () => [apiPath, 'assessment', 'check_number'].join('/'),
  saveNumberInfoPath: () => [apiPath, 'assessment', 'save_number_info'].join('/'),
  submitAssessmentPath: () => [apiPath, 'assessment', 'submit'].join('/'),
  getAssessmentByID: () => [apiPath, 'assessment', 'get_assessment_by_id'].join('/'),
  getAssessmentHistoryByDigits: () => [apiPath, 'assessment', 'get_history_by_digits'].join('/'),
  getAssessmentHistory: () => [apiPath, 'assessment', 'history'].join('/'),
  getPageCount: () => [apiPath, 'assessment', 'page_count'].join('/'),
  getNumberInfo: () => [apiPath, 'assessment', 'get_number'].join('/'),
  saveImagePath: () => [apiPath, 'assessment', 'save_image'].join('/'),
  deleteAssessmentPath: () => [apiPath, 'assessment', 'delete_by_id'].join('/')
};