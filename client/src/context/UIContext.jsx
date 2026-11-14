import { createContext, useCallback, useContext, useState } from 'react';
import Toast from '../components/Alert/Toast';
import Modal from '../components/UI/Modal';

const UIContext = createContext(null);

/**
 * App-wide toast + confirm dialog, replacing window.alert / window.confirm.
 *   const { toast, confirm } = useUI();
 *   toast('Saved', 'success');
 *   if (await confirm({ title: 'Delete?', message: '...', danger: true })) { ... }
 */
export const UIProvider = ({ children }) => {
  const [toastState, setToastState] = useState({ show: false, message: '', type: 'success' });
  const [confirmState, setConfirmState] = useState(null);

  const toast = useCallback((message, type = 'success') => {
    setToastState({ show: true, message, type });
  }, []);

  const confirm = useCallback(
    (options) => new Promise((resolve) => setConfirmState({ ...options, resolve })),
    []
  );

  const settle = (value) => {
    confirmState?.resolve(value);
    setConfirmState(null);
  };

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}

      <Toast
        show={toastState.show}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((t) => ({ ...t, show: false }))}
      />

      {confirmState && (
        <Modal onClose={() => settle(false)} maxWidth="max-w-md" label={confirmState.title || 'Confirm'}>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${confirmState.danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                <i className={`fas ${confirmState.danger ? 'fa-exclamation-triangle' : 'fa-question'}`} aria-hidden="true"></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy-900">{confirmState.title || 'Are you sure?'}</h2>
                {confirmState.message && <p className="text-sm text-gray-600 mt-1">{confirmState.message}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => settle(false)}
                className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
              >
                {confirmState.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                className={`px-5 py-2 text-white font-bold rounded-lg transition ${confirmState.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {confirmState.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
