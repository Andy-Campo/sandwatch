exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const result = await db.query('SELECT * FROM padres WHERE correo = $1', [correo]);
        
        // SI NO EXISTE: Devolvemos error y RETURN para detener todo
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const padre = result.rows[0];
        const match = await bcrypt.compare(contrasena, padre.contrasena);

        // SI NO COINCIDE: Devolvemos error y RETURN
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // SI TODO ESTÁ BIEN: Generamos token y respondemos
        const token = jwt.sign({ id_padre: padre.id_padre }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({ token, mensaje: "Login exitoso" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};