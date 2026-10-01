function Header({ title, subtitle }) {

    return (
        <header className="header">

            <div>
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>

        </header>
    );
}

export default Header;