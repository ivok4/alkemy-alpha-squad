import { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import authService from '../services/authService';
import RegistrationSuccessModal from './RegistrationSuccessModal';

export default function RegisterForm({ onToggleLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentTypeId: 1,
    documentNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [documentTypes, setDocumentTypes] = useState([
    { id: 1, code: 'DNI', name: 'Documento Nacional de Identidad (DNI)' },
    { id: 2, code: 'PAS', name: 'Pasaporte' },
  ]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [registeredData, setRegisteredData] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Fetch document types from backend
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const types = await authService.getDocumentTypes();
        if (types && types.length > 0) {
          setDocumentTypes(types);
          setFormData((prev) => ({
            ...prev,
            documentTypeId: types[0].id,
          }));
        }
      } catch (err) {
        console.warn('Using default document types due to network error:', err);
      }
    };
    fetchDocTypes();
  }, []);

  const selectedDocType = documentTypes.find((t) => t.id === Number(formData.documentTypeId)) || { code: 'DNI' };

  // Validation function
  const validate = (values) => {
    const newErrors = {};

    if (!values.firstName?.trim()) {
      newErrors.firstName = 'El nombre es obligatorio.';
    } else if (values.firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (!values.lastName?.trim()) {
      newErrors.lastName = 'El apellido es obligatorio.';
    } else if (values.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres.';
    }

    const docCode = (documentTypes.find((t) => t.id === Number(values.documentTypeId))?.code || 'DNI').toUpperCase();
    const cleanDocNumber = values.documentNumber?.trim() || '';

    if (!cleanDocNumber) {
      newErrors.documentNumber = 'El número de documento es obligatorio.';
    } else if (docCode === 'DNI') {
      if (!/^\d{7,8}$/.test(cleanDocNumber)) {
        newErrors.documentNumber = 'El DNI debe ser numérico de 7 u 8 dígitos.';
      }
    } else if (docCode === 'PAS') {
      if (!/^(?:[A-Za-z]{3}\d{6}|[A-Za-z0-9]{6,12})$/.test(cleanDocNumber)) {
        newErrors.documentNumber = 'Pasaporte inválido (formato argentino: 3 letras y 6 números).';
      }
    }

    if (!values.email?.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      newErrors.email = 'Ingrese un correo electrónico válido.';
    }

    if (!values.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (values.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!values.confirmPassword) {
      newErrors.confirmPassword = 'Confirme su contraseña.';
    } else if (values.confirmPassword !== values.password) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    return newErrors;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    const updatedValues = { ...formData, [field]: value };
    setFormData(updatedValues);

    if (touched[field]) {
      const validationErrors = validate(updatedValues);
      setErrors(validationErrors);
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate(formData);
    setErrors(validationErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      firstName: true,
      lastName: true,
      documentTypeId: true,
      documentNumber: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        documentTypeId: Number(formData.documentTypeId),
        documentNumber: formData.documentNumber.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const response = await authService.registerUser(payload);
      setRegisteredData(response);
      setSuccessModalOpen(true);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        documentTypeId: documentTypes[0]?.id || 1,
        documentNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setTouched({});
      setErrors({});
    } catch (err) {
      console.error('Registration error:', err);
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        'Ocurrió un error al procesar el registro. Verifique los datos e intente nuevamente.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '14px',
            bgcolor: 'rgba(56, 189, 248, 0.12)',
            mb: 1.5,
          }}
        >
          <PersonAddOutlined sx={{ fontSize: 28, color: '#38bdf8' }} />
        </Box>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, color: '#f3f4f6' }}
        >
          Crear Cuenta en DigitalArs
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
          Regístrate para obtener tu cuenta en pesos con Alias y CVU listos para operar
        </Typography>
      </Box>

      <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

      {serverError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setServerError('')}>
          {serverError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          {/* First Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              id="firstName"
              label="Nombre"
              variant="outlined"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              error={touched.firstName && Boolean(errors.firstName)}
              helperText={touched.firstName && errors.firstName}
              disabled={loading}
              required
            />
          </Grid>

          {/* Last Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              id="lastName"
              label="Apellido"
              variant="outlined"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              error={touched.lastName && Boolean(errors.lastName)}
              helperText={touched.lastName && errors.lastName}
              disabled={loading}
              required
            />
          </Grid>

          {/* Document Type */}
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth variant="outlined" disabled={loading}>
              <InputLabel id="documentType-label">Tipo de Doc.</InputLabel>
              <Select
                labelId="documentType-label"
                id="documentTypeId"
                value={formData.documentTypeId}
                label="Tipo de Doc."
                onChange={handleChange('documentTypeId')}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.code} - {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Document Number */}
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField
              fullWidth
              id="documentNumber"
              label="Número de Documento"
              variant="outlined"
              placeholder={selectedDocType.code === 'DNI' ? 'Ej: 38123456' : 'Ej: ABC123456'}
              value={formData.documentNumber}
              onChange={handleChange('documentNumber')}
              onBlur={handleBlur('documentNumber')}
              error={touched.documentNumber && Boolean(errors.documentNumber)}
              helperText={
                (touched.documentNumber && errors.documentNumber) ||
                (selectedDocType.code === 'DNI' ? '7 u 8 dígitos numéricos' : 'Formato alfanumérico')
              }
              disabled={loading}
              required
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              id="email"
              type="email"
              label="Correo Electrónico"
              variant="outlined"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              disabled={loading}
              required
            />
          </Grid>

          {/* Password */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              variant="outlined"
              value={formData.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              disabled={loading}
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="alternar visibilidad de contraseña"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: '#9ca3af' }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          {/* Confirm Password */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirmar Contraseña"
              variant="outlined"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              disabled={loading}
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="alternar visibilidad de confirmar contraseña"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: '#9ca3af' }}
                      >
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ mt: 3.5 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{
              py: 1.4,
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : 'Registrarme y Crear Cuenta'}
          </Button>
        </Box>

        {onToggleLogin && (
          <>
            <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                ¿Ya tienes una cuenta registrada?{' '}
                <Button
                  variant="text"
                  color="primary"
                  onClick={onToggleLogin}
                  sx={{ fontWeight: 700, textTransform: 'none', p: 0, minWidth: 0 }}
                >
                  Inicia sesión aquí
                </Button>
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Success Modal */}
      <RegistrationSuccessModal
        open={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          if (onToggleLogin) onToggleLogin();
        }}
        registrationData={registeredData}
      />
    </Box>
  );
}
