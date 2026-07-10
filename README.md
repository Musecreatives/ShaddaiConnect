# ShaddaiConnect
# Shaddai
A self-hosted subscriber management and billing platform for **Shaddai Comm Ventures**, 
a community WiFi hotspot business. Customers purchase time-based or monthly internet 
vouchers via Paystack, redeem them on a pfSense captive portal, and are authenticated 
through FreeRADIUS backed by MariaDB.

**Stack:** NestJS (API) · Next.js (customer buy site + admin console) · MariaDB · 
FreeRADIUS · pfSense · Paystack

**What it does:**
- Issues time-based (hourly) and monthly unlimited internet vouchers, each mapped 
  directly to a RADIUS user (`radcheck`/`radreply`)
- Accepts payments via Paystack and auto-generates vouchers on successful charge
- Gives admins a console for manual voucher creation, live session monitoring 
  (via RADIUS accounting), and plan management
- Enforces per-plan device limits via RADIUS `Simultaneous-Use` rather than 
  fragile MAC-address locking

Built for a single WISP deployment, but architected generically enough 
(plan-driven RADIUS attribute mapping) that it could be adapted for other 
small ISPs running a similar pfSense + FreeRADIUS stack.