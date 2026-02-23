import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import { useAuthStore } from '../store/AuthStore';

export const usePenalty = () => {
    const { profile } = useAuthStore();
    const sub = profile?.suscripcion;

    const isOverdue = sub && sub.dias_restantes < -10; // Más de 10 días de mora
    const [showPenalty, setShowPenalty] = useState(false);

    const triggerPenalty = async (action = null) => {
        if (!isOverdue) {
            if (action) action();
            return;
        }

        // Si es admin principal y está en mora, aplicar penalización
        if (profile?.id_rol === 1) {
            let timerInterval;
            const result = await Swal.fire({
                title: '¡Aviso de Pago Pendiente! 💳',
                html: `
          <div style="text-align: center;">
            <p style="font-size: 18px; margin-bottom: 20px;">
              Tu cuenta presenta una mora de <b>${Math.abs(Math.floor(sub.dias_restantes))} días</b>.
            </p>
            <p style="color: #ff5e57; font-weight: bold;">
              <i>"Paga que los desarrolladores también comemos"</i>
            </p>
            <div style="margin-top: 20px; font-size: 14px; color: #888;">
              Podrás continuar en <b></b> segundos...
            </div>
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
            <p style="font-size: 15px;">Ponte al día hoy con un <b>3% de recargo</b> por mora.</p>
          </div>
        `,
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: true,
                confirmButtonText: 'Pagar con Recargo (+3%) 🚀',
                confirmButtonColor: '#ff6a00',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                    const timer = Swal.getHtmlContainer().querySelector('b');
                    timerInterval = setInterval(() => {
                        timer.textContent = (Swal.getTimerLeft() / 1000).toFixed(0);
                    }, 100);
                },
                willClose: () => {
                    clearInterval(timerInterval);
                }
            });

            if (result.isConfirmed) {
                window.location.href = "/planes";
            } else if (action) {
                action();
            }
        } else {
            // Si es empleado, solo dejar pasar
            if (action) action();
        }
    };

    return { isOverdue, triggerPenalty };
};
