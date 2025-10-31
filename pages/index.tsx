export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Система гарантийных талонов насосов</h1>
      <p>
        Веб-приложение для регистрации, подтверждения и управления гарантийными талонами.
      </p>
      <h3>Выберите роль:</h3>
      <ul>
        <li><a href="/buyer">Я покупатель</a></li>
        <li><a href="/seller">Я продавец</a></li>
        <li><a href="/installer">Я монтажник</a></li>
        <li><a href="/admin">Администратор</a></li>
      </ul>
    </main>
  );
}
