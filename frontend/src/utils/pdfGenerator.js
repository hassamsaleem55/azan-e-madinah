import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateBookingPDF = async (booking) => {
    // Create a temporary div to hold the HTML content
    const element = document.createElement('div');
    element.style.padding = '30px';
    element.style.backgroundColor = '#fff';
    element.style.width = '850px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.color = '#333';

    const statusBg = getStatusBgColor(booking.status);
    const statusColor = booking.status.toLowerCase() === 'confirmed' ? '#fff' : booking.status.toLowerCase() === 'on hold' ? '#333' : '#fff';

    // element.innerHTML = `
    //     <div>
    //         <!-- Header with logos and status -->
    //         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 12px; border-bottom: 2px solid #ddd;">
    //             <div style="font-size: 26px; font-weight: bold; color: #1e40af; letter-spacing: 2px;">SKYPASS</div>
    //             <div style="text-align: center;">
    //                 <div style="background-color: ${statusBg}; color: ${statusColor}; padding: 6px 20px; border-radius: 3px; font-weight: bold; font-size: 12px; display: inline-block;">
    //                     ${booking.status.toUpperCase()}
    //                 </div>
    //             </div>
    //             <div style="font-size: 22px; color: #22c55e; font-weight: bold; letter-spacing: 1px;">AIR SIAL</div>
    //         </div>

    //         <!-- Title -->
    //         <h1 style="color: #0284c7; font-size: 26px; text-align: center; margin-bottom: 25px; margin-top: 0;">Electronic Ticket Receipt</h1>

    //         <!-- Booking Details Section -->
    //         <div style="background-color: #0369a1; color: white; padding: 18px; border-radius: 3px; margin-bottom: 25px;">
    //             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 35px; font-size: 12px;">
    //                 <div>
    //                     <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px; opacity: 0.9;">Booking Reference Number (PNR)</div>
    //                     <div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; letter-spacing: 1px;">${booking.pnr || 'N/A'}</div>
    //                     <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px; opacity: 0.9;">Issued By</div>
    //                     <div style="font-size: 12px;">${getAgencyName(booking)}</div>
    //                 </div>
    //                 <div>
    //                     <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px; opacity: 0.9;">Booking ID</div>
    //                     <div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; letter-spacing: 1px;">${booking.bookingReference}</div>
    //                     <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px; opacity: 0.9;">Contact</div>
    //                     <div style="font-size: 12px;">${booking.contactPersonName || 'N/A'}</div>
    //                 </div>
    //             </div>
    //         </div>

    //         <!-- Flight Information -->
    //         <div style="margin-bottom: 25px;">
    //             <h2 style="background-color: #f59e0b; color: white; padding: 10px 18px; margin: 0 0 12px 0; font-size: 13px; border-radius: 3px; font-weight: bold;">
    //                 Flight 1 - ${booking.sector || 'N/A'}
    //             </h2>

    //             <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
    //                 <thead>
    //                     <tr style="background-color: #1e40af; color: white;">
    //                         <th style="padding: 10px 12px; text-align: left; border: 1px solid #ddd; font-weight: bold; font-size: 11px;">AIRLINE NAME</th>
    //                         <th style="padding: 10px 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 11px;">FLIGHT #</th>
    //                         <th style="padding: 10px 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 11px;">DEPARTURE</th>
    //                         <th style="padding: 10px 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 11px;">ARRIVAL</th>
    //                     </tr>
    //                 </thead>
    //                 <tbody>
    //                     <tr>
    //                         <td style="padding: 10px 12px; border: 1px solid #ddd; font-size: 12px;">${booking.airline?.name || 'Air Arabia'}</td>
    //                         <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; font-size: 12px;">${booking.flightNumber || 'PF 784'}</td>
    //                         <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: center; font-size: 12px;">
    //                             <div style="font-weight: bold;">${booking.departureTime || '11:20'}</div>
    //                             <div style="font-size: 10px;">${formatDate(booking.departureDate)}</div>
    //                         </td>
    //                         <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: center; font-size: 12px;">
    //                             <div style="font-weight: bold;">${booking.arrivalTime || '14:00'}</div>
    //                             <div style="font-size: 10px;">${formatDate(booking.departureDate)}</div>
    //                         </td>
    //                     </tr>
    //                 </tbody>
    //             </table>
    //         </div>

    //         <!-- Passenger Details -->
    //         <div style="margin-bottom: 25px;">
    //             <h3 style="background-color: #0369a1; color: white; padding: 9px 15px; margin: 0 0 12px 0; font-size: 12px; font-weight: bold; border-radius: 3px;">Passenger Details</h3>

    //             <table style="width: 100%; border-collapse: collapse;">
    //                 <thead>
    //                     <tr style="background-color: #0369a1; color: white;">
    //                         <th style="padding: 9px 10px; text-align: left; border: 1px solid #0369a1; font-weight: bold; font-size: 11px; width: 8%;">Sr #</th>
    //                         <th style="padding: 9px 10px; text-align: left; border: 1px solid #0369a1; font-weight: bold; font-size: 11px;">Passenger Name</th>
    //                         <th style="padding: 9px 10px; text-align: center; border: 1px solid #0369a1; font-weight: bold; font-size: 11px; width: 12%;">Status</th>
    //                         <th style="padding: 9px 10px; text-align: center; border: 1px solid #0369a1; font-weight: bold; font-size: 11px; width: 10%;">Meal</th>
    //                         <th style="padding: 9px 10px; text-align: right; border: 1px solid #0369a1; font-weight: bold; font-size: 11px; width: 15%;">Price</th>
    //                     </tr>
    //                 </thead>
    //                 <tbody>
    //                     ${booking.passengers && booking.passengers.length > 0 ? booking.passengers.map((p, idx) => `
    //                         <tr>
    //                             <td style="padding: 9px 10px; border: 1px solid #ddd; text-align: left; font-size: 11px;">${idx + 1}</td>
    //                             <td style="padding: 9px 10px; border: 1px solid #ddd; text-align: left; font-size: 11px;">${p.name || 'N/A'}</td>
    //                             <td style="padding: 9px 10px; border: 1px solid #ddd; text-align: center; font-size: 11px;">${booking.status}</td>
    //                             <td style="padding: 9px 10px; border: 1px solid #ddd; text-align: center; font-size: 11px;">Yes</td>
    //                             <td style="padding: 9px 10px; border: 1px solid #ddd; text-align: right; font-size: 11px;">PKR ${(booking.pricing?.grandTotal / (booking.passengers?.length || 1)).toLocaleString()}</td>
    //                         </tr>
    //                     `).join('') : `
    //                         <tr>
    //                             <td colspan="5" style="padding: 9px 10px; border: 1px solid #ddd; text-align: center; font-size: 11px;">No passengers data available</td>
    //                         </tr>
    //                     `}
    //                     <tr style="background-color: #f3f4f6;">
    //                         <td colspan="4" style="padding: 9px 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 11px;">Total</td>
    //                         <td style="padding: 9px 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 11px;">PKR ${booking.pricing?.grandTotal?.toLocaleString() || '0'}</td>
    //                     </tr>
    //                 </tbody>
    //             </table>
    //         </div>

    //         <!-- Terms & Conditions -->
    //         <div style="background-color: #f3f4f6; padding: 16px; border-radius: 3px; margin-bottom: 18px;">
    //             <h3 style="color: #0284c7; font-size: 12px; margin: 0 0 10px 0; font-weight: bold;">Terms & Conditions</h3>
    //             <ol style="font-size: 10px; line-height: 1.6; margin: 0; padding-left: 18px; color: #333;">
    //                 <li><strong>PASSENGER SHOULD REPORT AT CHECK-IN COUNTER AT LEAST 04:00 HOURS PRIOR TO FLIGHT.</strong></li>
    //                 <li><strong>TICKETS ARE NON-REFUNDABLE AND NON-CHANGEABLE ANY TIME.</strong></li>
    //                 <li><strong>IN CASE YOU REQUEST A REFUND DUE TO A FLIGHT DELAY OR EARLY DEPARTURE, PLEASE NOTE THAT ANY PSF (PASSENGER SERVICE FEE) WILL BE NON-REFUNDABLE.</strong></li>
    //             </ol>
    //         </div>

    //         <!-- Footer -->
    //         <div style="text-align: center; font-size: 9px; color: #666; padding-top: 12px; border-top: 1px solid #ddd;">
    //             <p style="margin: 6px 0;">This is an electronically generated receipt. No signature is required.</p>
    //             <p style="margin: 6px 0;">Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
    //         </div>
    //     </div>
    // `;

    // Append to body temporarily

    element.innerHTML = `
<div style="max-width:850px; margin:auto;">

    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:center;
        padding-bottom:16px; border-bottom:2px solid #ddd; margin-bottom:28px;">
        
        <div style="font-size:26px; font-weight:800; color:#1e40af; letter-spacing:2px;">
            <img src="/src/assets/images/rihla_logo.png" style="width:120px;" />
        </div>
        
        <div>
    <span style="
        background:${statusBg};
        color:${statusColor};
        padding:6px 28px;
        border-radius:4px;
        font-size:12px;
        font-weight:700;
        letter-spacing:1px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        text-align:center;">
        ${booking.status.toUpperCase()}
    </span>
</div>


        <div style="font-size:22px; font-weight:800; color:#22c55e;">
            <img src=${booking.airline.logoUrl} style="width:120px;" />
        </div>
    </div>

    <!-- Title -->
    <h1 style="
        text-align:center;
        font-size:26px;
        color:#0284c7;
        margin:0 0 26px 0;
        font-weight:800;">
        Electronic Ticket Receipt
    </h1>

    <!-- Booking Summary -->
    <div style="
        background:#0369a1;
        color:white;
        padding:22px;
        border-radius:6px;
        margin-bottom:28px;">

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px; font-size:12px;">

            <div>
                <div style="opacity:.8; font-size:11px;">PNR</div>
                <div style="font-size:20px; font-weight:800; letter-spacing:1px; margin-bottom:14px;">
                    ${booking.pnr || 'N/A'}
                </div>

                <div style="opacity:.8; font-size:11px;">Issued By</div>
                <div style="font-weight:600;">
                    ${getAgencyName(booking)}
                </div>
            </div>

            <div>
                <div style="opacity:.8; font-size:11px;">Booking Reference</div>
                <div style="font-size:20px; font-weight:800; margin-bottom:14px;">
                    ${booking.bookingReference}
                </div>

                <div style="opacity:.8; font-size:11px;">Contact Person</div>
                <div style="font-weight:600;">
                    ${booking.contactPersonName || 'N/A'}
                </div>
            </div>

        </div>
    </div>

    <!-- Flight Info -->
    <div style="margin-bottom:30px;">
        <div style="
            background:#f59e0b;
            color:white;
            padding:10px 18px;
            border-radius:4px;
            font-size:13px;
            font-weight:800;
            margin-bottom:12px;">
            Flight 1 – ${booking.sector || 'N/A'}
        </div>

        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background:#1e40af; color:white;">
                    <th style="padding:10px; font-size:11px; text-align:left;">Airline</th>
                    <th style="padding:10px; font-size:11px; text-align:center;">Flight</th>
                    <th style="padding:10px; font-size:11px; text-align:center;">Departure</th>
                    <th style="padding:10px; font-size:11px; text-align:center;">Arrival</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding:12px; font-size:12px; font-weight:600;">
                        ${booking.airline?.name || 'Air Arabia'}
                    </td>
                    <td style="padding:12px; font-size:12px; text-align:center; font-weight:700;">
                        PF 784
                    </td>
                    <td style="padding:12px; text-align:center;">
                        <div style="font-weight:700;">11:20</div>
                        <div style="font-size:10px;">
                            ${formatDate(booking.departureDate)}
                        </div>
                    </td>
                    <td style="padding:12px; text-align:center;">
                        <div style="font-weight:700;">14:00</div>
                        <div style="font-size:10px;">
                            ${formatDate(booking.departureDate)}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Passenger Details -->
    <div style="margin-bottom:30px;">
        <div style="
            background:#0369a1;
            color:white;
            padding:10px 16px;
            border-radius:4px;
            font-size:12px;
            font-weight:800;
            margin-bottom:12px;">
            Passenger Details
        </div>

        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background:#0369a1; color:white;">
                    <th style="padding:9px; font-size:11px; text-align:left;">#</th>
                    <th style="padding:9px; font-size:11px; text-align:left;">Passenger</th>
                    <th style="padding:9px; font-size:11px; text-align:left;">Passport</th>
                    <th style="padding:9px; font-size:11px; text-align:center;">Status</th>
                    <th style="padding:9px; font-size:11px; text-align:right;">Fare</th>
                </tr>
            </thead>
            <tbody>
                ${booking.passengers?.map((p, i) => `
                <tr>
                    <td style="padding:9px; font-size:11px;">${i + 1}</td>
                    <td style="padding:9px; font-size:11px; font-weight:600;">
                        ${p.title || ''} ${p.givenName || ''} ${p.surName || ''}
                    </td>
                    <td style="padding:9px; font-size:11px;">
                        ${p.passport || 'N/A'}
                    </td>
                    <td style="padding:9px; font-size:11px; text-align:center;">
                        ${booking.status}
                    </td>
                    <td style="padding:9px; font-size:11px; text-align:right;">
                        PKR ${(booking.pricing.grandTotal / booking.passengers.length).toLocaleString()}
                    </td>
                </tr>
                `).join('')}
                <tr style="background:#f3f4f6;">
                    <td colspan="4" style="padding:10px; text-align:right; font-weight:800;">
                        Total
                    </td>
                    <td style="padding:10px; text-align:right; font-weight:800;">
                        PKR ${booking.pricing.grandTotal.toLocaleString()}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Terms -->
    <div style="background:#f3f4f6; padding:18px; border-radius:6px;">
        <div style="color:#0284c7; font-size:12px; font-weight:800; margin-bottom:10px;">
            Terms & Conditions
        </div>
        <ol style="font-size:10px; line-height:1.6; margin:0; padding-left:18px;">
            <li><strong>Passenger must report 04 hours before departure.</strong></li>
            <li><strong>Tickets are non-refundable & non-changeable.</strong></li>
            <li><strong>PSF is non-refundable in all cases.</strong></li>
        </ol>
    </div>

    <!-- Footer -->
    <div style="margin-top:18px; border-top:1px solid #ddd; padding-top:12px;
        font-size:9px; color:#666; text-align:center;">
        <div>System generated ticket – no signature required</div>
        <div>
            Generated on ${new Date().toLocaleString('en-GB')}
        </div>
    </div>

</div>
`;

    document.body.appendChild(element);

    try {
        // Convert HTML to canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297; // A4 height in mm

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= 297;
        }

        // Download PDF
        pdf.save(`Booking-${booking.bookingReference}.pdf`);
    } finally {
        // Remove temporary element
        document.body.removeChild(element);
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const getAgencyName = (booking) => {
    if (typeof booking.userId === 'object' && booking.userId?.companyName) {
        return booking.userId.companyName;
    }
    return 'SUPRA TRAVEL & TOURS';
};

const getStatusBgColor = (status) => {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return '#22c55e'; // green
        case 'cancelled':
            return '#ef4444'; // red
        case 'on hold':
        default:
            return '#eab308'; // yellow
    }
};
