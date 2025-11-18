// Validation schemas for forms

export const loginValidation = {
  email: {
    required: 'Email là bắt buộc',
    pattern: {
      value: /^\S+@\S+$/i,
      message: 'Email không hợp lệ'
    }
  },
  password: {
    required: 'Mật khẩu là bắt buộc',
    minLength: {
      value: 6,
      message: 'Mật khẩu phải có ít nhất 6 ký tự'
    }
  }
};

export const employeeValidation = {
  firstName: {
    required: 'Họ là bắt buộc',
    minLength: {
      value: 2,
      message: 'Họ phải có ít nhất 2 ký tự'
    }
  },
  lastName: {
    required: 'Tên là bắt buộc',
    minLength: {
      value: 2,
      message: 'Tên phải có ít nhất 2 ký tự'
    }
  },
  email: {
    required: 'Email là bắt buộc',
    pattern: {
      value: /^\S+@\S+$/i,
      message: 'Email không hợp lệ'
    }
  },
  phoneNumber: {
    pattern: {
      value: /^[\+]?[0-9\s\-\(\)]{10,}$/,
      message: 'Số điện thoại không hợp lệ'
    }
  },
  department: {
    required: 'Phòng ban là bắt buộc'
  },
  position: {
    required: 'Chức vụ là bắt buộc'
  },
  hireDate: {
    required: 'Ngày vào làm là bắt buộc'
  }
};

export const absenceRequestValidation = {
  absenceType: {
    required: 'Loại nghỉ phép là bắt buộc'
  },
  startDate: {
    required: 'Ngày bắt đầu là bắt buộc',
    validate: (value) => {
      const today = new Date().toISOString().split('T')[0];
      return value >= today || 'Ngày bắt đầu không thể là quá khứ';
    }
  },
  endDate: {
    required: 'Ngày kết thúc là bắt buộc',
    validate: (value, formValues) => {
      if (!formValues.startDate) return true;
      return value >= formValues.startDate || 'Ngày kết thúc phải sau ngày bắt đầu';
    }
  },
  reason: {
    required: 'Lý do là bắt buộc',
    minLength: {
      value: 10,
      message: 'Lý do phải có ít nhất 10 ký tự'
    }
  }
};

export const documentValidation = {
  file: {
    required: 'Vui lòng chọn tệp',
    validate: (fileList) => {
      if (!fileList || fileList.length === 0) return 'Vui lòng chọn tệp';
      
      const file = fileList[0];
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ];
      
      if (file.size > maxSize) {
        return 'Tệp không được vượt quá 10MB';
      }
      
      if (!allowedTypes.includes(file.type)) {
        return 'Chỉ hỗ trợ tệp PDF, DOC, DOCX, XLS, XLSX, TXT';
      }
      
      return true;
    }
  },
  title: {
    required: 'Tiêu đề là bắt buộc',
    minLength: {
      value: 3,
      message: 'Tiêu đề phải có ít nhất 3 ký tự'
    }
  },
  category: {
    required: 'Danh mục là bắt buộc'
  },
  accessLevel: {
    required: 'Quyền truy cập là bắt buộc'
  }
};

export const eventValidation = {
  title: {
    required: 'Tiêu đề sự kiện là bắt buộc',
    minLength: {
      value: 3,
      message: 'Tiêu đề phải có ít nhất 3 ký tự'
    }
  },
  type: {
    required: 'Loại sự kiện là bắt buộc'
  },
  startDate: {
    required: 'Ngày bắt đầu là bắt buộc'
  },
  endDate: {
    validate: (value, formValues) => {
      if (!value || !formValues.startDate) return true;
      return value >= formValues.startDate || 'Ngày kết thúc phải sau ngày bắt đầu';
    }
  }
};

export const changePasswordValidation = {
  oldPassword: {
    required: 'Mật khẩu hiện tại là bắt buộc'
  },
  newPassword: {
    required: 'Mật khẩu mới là bắt buộc',
    minLength: {
      value: 6,
      message: 'Mật khẩu phải có ít nhất 6 ký tự'
    }
  },
  confirmPassword: {
    required: 'Xác nhận mật khẩu là bắt buộc',
    validate: (value, formValues) => {
      return value === formValues.newPassword || 'Mật khẩu xác nhận không khớp';
    }
  }
};
