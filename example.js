    /**
     * Obtiene facturas generadas
     * @param req
     * @param res 
     */
    public async get_facturas_periodo (req: Request, res: Response): Promise<any>{
        dateInit = req.query.dateInit;
        dateEnd = req.query.dateEnd;

        const page = Number(req.query.pageIndex);
        const limit = Number(req.query.pageSize);
        const offset = (page - 1) * limit;
        
        let structure = {data: 0, itemsCount: 0};
        let strWhere = Array();
        let strWhereStatement = null;
        let strCount: string = 'SELECT COUNT(f.id) AS total ' +
            'FROM facturas AS f ' +
            'LEFT JOIN clientes AS c ON f.cliente_id = c.id ' +
            'LEFT JOIN clientesdist AS cd ON f.clientedist_id = cd.id';

        let strQuery: string = 'SELECT f.id, c.razonsocial, cd.nombre, f.total, f.pagada, DATE_FORMAT(f.fechacreada,"%d-%m-%Y") AS fechacreada, DATE_FORMAT(f.fechavence,"%d-%m-%Y") AS fechavence, DATE_FORMAT(f.fechapago,"%d-%m-%Y") AS fechapago, (SELECT concat(enombres," ",apellidos) FROM empleados WHERE id = f.regempleado_id ) AS eregistro, (SELECT concat(enombres," ",apellidos) FROM empleados WHERE id = f.revempleado_id ) AS ereviso, (SELECT concat(enombres," ",apellidos) FROM empleados WHERE id = f.supempleado_id ) AS esuperviso, f.cancelada ' +
            'FROM facturas AS f ' +
            'LEFT JOIN clientes AS c ON f.cliente_id = c.id ' +
            'LEFT JOIN clientesdist AS cd ON f.clientedist_id = cd.id ' +
            'LEFT JOIN empleados AS e ON f.regempleado_id = e.id';
        
        /*
        let strQuery: string = 'SELECT f.id, c.razonsocial, cd.nombre, f.total, f.pagada, DATE_FORMAT(f.fechacreada,"%d-%m-%Y") AS fechacreada, DATE_FORMAT(f.fechavence,"%d-%m-%Y") AS fechavence, DATE_FORMAT(f.fechapago,"%d-%m-%Y") AS fechapago, (SELECT concat(enombres," ",apellidos) FROM empleados WHERE id = f.regempleado_id ) AS eregistro, (SELECT concat(enombres," ",apellidos) FROM empleados WHERE id = f.revempleado_id ) AS ereviso, (SELECT concat(enombres," ",apellidos) FROM empleados WHERE id = f.supempleado_id ) AS esuperviso, f.cancelada ' +
            'FROM FACTURAS AS f ' +
            'LEFT JOIN clientes AS c ON f.cliente_id = c.id ' +
            'LEFT JOIN clientesdist AS cd ON f.clientedist_id = cd.id ' +
            'LEFT JOIN empleados AS e ON f.regempleado_id = e.id ' +
            'WHERE f.fechacreada >= ? AND f.fechacreada <= ?';
            */
        
        if (req.query.id != undefined){
            strWhere.push('f.id='+ req.query.id);
        }
        
        if (req.query.razonsocial !== ''){
            strWhere.push('c.razonsocial LIKE \'%'+ req.query.razonsocial.trim() + '%\'');
        }

        if (req.query.nombre !== ''){
            strWhere.push('cd.nombre LIKE \'%'+ req.query.nombre.trim() + '%\'');
        }

        if ((Number(req.query.total) > 0) && (Number(req.query.total) !== NaN) ){
            strWhere.push('f.total='+ req.query.total);
        }
        
        
        strWhere.push('f.fechacreada >= \''+ dateInit +'\'' );
        strWhere.push('f.fechacreada <= \''+ dateEnd +'\'');

        for (var i = 0; i < strWhere.length; i++) {
            if (i==0){
                strWhereStatement = ' WHERE';
                strWhereStatement += ' ' + strWhere[i];
            }else{
                strWhereStatement += ' AND ' + strWhere[i];
            }
        }
        if (strWhereStatement !== null){
            strCount += strWhereStatement;
            strQuery += strWhereStatement;
        }
        strQuery += ' LIMIT ? OFFSET ?';
        
        try{
            const registros = await pool.query(strCount);
            const facturas = await pool.query(strQuery,[limit,offset]);
            if (facturas.length > 0){
                var sumaTotal = 0;
                for (let row of facturas) {
                    sumaTotal += row.total;
                }
                return res.json( {itemsCount: registros[0].total, data: facturas });
            }else{
                return res.json({itemsCount: 0, data: 0, msg: 'not found records'});
            }
        }catch (e){
            return res.status(404).json({error: 'ERROR' + e});
        }
    }
