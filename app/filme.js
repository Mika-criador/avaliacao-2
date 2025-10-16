import { View, Text, Button, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('filme.db');
db.execSync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS filmes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    ano INTEGER NOT NULL,
    genero TEXT NOT NULL
  );
`);

function getFilmes() {
  return db.getAllSync('SELECT * FROM filmes ORDER BY id DESC'); 
}

function insertFilmes(titulo, ano, genero) {
  db.runSync('INSERT INTO filmes (titulo, ano, genero) VALUES (?, ?, ?)', [titulo, ano, genero]);
}

function deleteFilmes(id) {
  db.runSync('DELETE FROM filmes WHERE id = ?', [id]);
}

function deleteAllFilmes() {
  db.runSync('DELETE FROM filmes');
}

function getFilmeById(id) {
  const [filme] = db.getAllSync('SELECT * FROM filmes WHERE id = ?', [id]);
  return filme;
}

function updateFilme(id, titulo, ano, genero) {
  db.runSync('UPDATE filmes SET titulo = ?, ano = ?, genero = ? WHERE id = ?', [titulo, ano, genero, id]);
}

export default function sqlite() {
  const [titulo, setTitulo] = useState("");
  const [ano, setAno] = useState("");
  const [genero, setGenero] = useState("");
  const [filmes, setFilmes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  function carregarFilmes() {
    const data = getFilmes();
    setFilmes(data);
  }

  function editarFilme(id) {
    const filme = getFilmeById(id);
    if (!filme) return;
    setTitulo(filme.titulo);
    const val = String(filme.ano);
    setAno(val);
    setGenero(filme.genero);
    setEditandoId(id);
  }

  function atualizarFilme() {
    const desc = titulo.trim();
    const val = parseInt(ano);
    const cat = genero.trim();
    updateFilme(editandoId, desc, val, cat);
    setTitulo("");
    setAno("");
    setGenero("");
    setEditandoId(null);
    carregarFilmes();
  }

  function salvarFilmes() {
    const desc = titulo.trim();
    const val = parseInt(ano);
    const cat = genero.trim();

    
    if (!desc || isNaN(val) || val <= 0 || !cat) {
      return;
    }
    
    
   
    insertFilmes(desc, val, cat);
    setTitulo("");
    setAno("");
    setGenero("");
    carregarFilmes(); 
  }

  function excluirFilmes(id) {
    deleteFilmes(id);
    carregarFilmes();
  }

  function limparTudo() {
    deleteAllFilmes();
    carregarFilmes();
  }

  useEffect(() => {
    carregarFilmes();
  }, []);


  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Meus Filmes</Text>

      <View style={estilos.linhaEntrada}>
        <TextInput
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Titulo"
          style={estilos.campoTexto}
        />
        <TextInput
          value={ano}
          onChangeText={setAno}
          placeholder="Ano"
          keyboardType="numeric"
          style={estilos.campoTexto}
        />
        <TextInput
          value={genero}
          onChangeText={setGenero}
          placeholder="Genero"
          style={estilos.campoTexto}
        />
      </View>

      <View style={estilos.botoesSalvaAtualiza}>
        <Button title="Salvar" onPress={salvarFilmes} disabled={!!editandoId} /> 
        <Button title="Atualizar" onPress={atualizarFilme} disabled={!editandoId} />
      </View>

      <View style={estilos.botoesAcao}>
        <Button title="Carregar filmes" onPress={carregarFilmes} />
        <Button title="Apagar todos" onPress={limparTudo} color="red" />
      </View>

      <FlatList
        data={filmes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={estilos.itemLinha}>
            <Text> {item.titulo} - {item.ano} - {item.genero}</Text>
            
               <View style={estilos.acoesLinha}>
              <Button title="E" onPress={() => editarFilme(item.id)} />
              <Button title="X" color="#ff0101ff" onPress={() => excluirFilmes(item.id)} />
            </View>
          </View>
        )}
      />
   

      <View style={estilos.rodape}>
        <Button title="Voltar" onPress={() => router.back()} />
        <Button title="Início" onPress={() => router.replace("/")} />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  titulo: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 8 
  },
  linhaEntrada: { 
    flex: 1,
    alignItems: "center", 
    marginBottom: 8, 
    gap: 8 
  },
  campoTexto: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    height: 60, 
    width: 300 
  },
  botoesAcao: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginVertical: 10 
  },
  botoesSalvaAtualiza: { 
    flexDirection: "row", 
    justifyContent: "center",
    gap: 10

  },
  itemLinha: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 6 
  },
    acoesLinha: {
    flexDirection: "row",
    gap: 4,
  },
  textoItem: { 
    fontSize: 16 
  },
  botaoExcluir: { 
    color: "red", 
    fontWeight: "bold", 
    fontSize: 25, 
    marginLeft: 10 
  },
  total: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginTop: 10 
  },
  rodape: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 20 
  }
});
