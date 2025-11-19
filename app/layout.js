export const metadata = {
  title: 'Clonefy Player Wrapper',
  description: 'Base layout'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
